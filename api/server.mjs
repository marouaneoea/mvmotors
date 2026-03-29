#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import { load } from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3001;

app.use(cors());

const BRAND_ALIASES = {
  'vw': 'Volkswagen', 'volkswagen': 'Volkswagen',
  'bmw': 'BMW',
  'mercedes': 'Mercedes-Benz', 'mercedes-benz': 'Mercedes-Benz',
  'peugeot': 'Peugeot', 'peugot': 'Peugeot', 'peagout': 'Peugeot',
  'citroen': 'Citroën', 'citroën': 'Citroën',
  'renault': 'Renault', 'opel': 'Opel', 'ford': 'Ford', 'audi': 'Audi',
  'seat': 'SEAT', 'skoda': 'Škoda', 'škoda': 'Škoda',
  'toyota': 'Toyota', 'honda': 'Honda', 'hyundai': 'Hyundai', 'kia': 'Kia',
  'nissan': 'Nissan', 'mazda': 'Mazda', 'fiat': 'Fiat', 'alfa': 'Alfa Romeo',
  'volvo': 'Volvo', 'mini': 'MINI', 'jeep': 'Jeep', 'dacia': 'Dacia',
  'tesla': 'Tesla', 'jaguar': 'Jaguar', 'porsche': 'Porsche', 'lexus': 'Lexus',
  'subaru': 'Subaru', 'suzuki': 'Suzuki', 'mitsubishi': 'Mitsubishi',
  'landrover': 'Land Rover', 'land rover': 'Land Rover',
};

function normalizeBrand(brand) {
  const key = brand.toLowerCase().trim();
  return BRAND_ALIASES[key] ?? brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function buildEmailHtml(newCars) {
  const carRows = newCars.map(car => `
    <tr>
      <td style="padding:16px;border-bottom:1px solid #2a2a2a;">
        <a href="${car.url}" style="text-decoration:none;color:inherit;">
          <img src="${car.image}" alt="${car.title}" width="160" style="border-radius:6px;display:block;margin-bottom:10px;" />
          <strong style="color:#ffffff;font-size:15px;">${car.title}</strong><br/>
          <span style="color:#c9a84c;font-size:16px;font-weight:bold;">€${car.price.toLocaleString('nl-BE')}</span><br/>
          <span style="color:#888;font-size:13px;">${car.year} · ${car.mileage.toLocaleString('nl-BE')} km · ${car.fuel}</span>
        </a>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#141414;font-family:sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:#1e1e1e;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="background:#c9a84c;padding:24px;text-align:center;">
            <h1 style="margin:0;color:#141414;font-size:22px;letter-spacing:2px;">MV MOTORS</h1>
            <p style="margin:6px 0 0;color:#141414;font-size:14px;">
              ${newCars.length} nieuwe wagen${newCars.length > 1 ? 's' : ''} toegevoegd
            </p>
          </td>
        </tr>
        ${carRows}
        <tr>
          <td style="padding:24px;text-align:center;">
            <a href="https://mvmotors.be/#voertuigen"
               style="display:inline-block;background:#c9a84c;color:#141414;padding:12px 28px;border-radius:6px;font-weight:bold;text-decoration:none;letter-spacing:1px;">
              BEKIJK ONS AANBOD
            </a>
            <p style="color:#555;font-size:11px;margin-top:20px;">
              U ontvangt deze e-mail omdat u zich heeft ingeschreven op mvmotors.be
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

async function notifySubscribers(newCars) {
  const { data: subscribers, error } = await supabase
    .from('subscribers')
    .select('email');

  if (error || !subscribers?.length) return;

  const html = buildEmailHtml(newCars);
  const subject = `${newCars.length} nieuwe wagen${newCars.length > 1 ? 's' : ''} bij MV Motors`;

  const batch = subscribers.map(sub => ({
    from: process.env.RESEND_FROM,
    to: sub.email,
    subject,
    html,
  }));

  const res = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(batch),
  });

  if (!res.ok) {
    console.error('Failed to send emails:', await res.text());
  } else {
    console.log(`📧 Notified ${subscribers.length} subscriber(s) about ${newCars.length} new car(s)`);
  }
}

async function scrapeAndSync() {

  const res = await fetch('https://www.2dehands.be/u/mv-motors/35556286/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html',
    }
  });

  const html = await res.text();
  const $ = load(html);

  const nextDataScript = $('#__NEXT_DATA__').html();
  if (!nextDataScript) throw new Error('Could not find listing data');

  const nextData = JSON.parse(nextDataScript);
  const listings = nextData.props?.pageProps?.searchRequestAndResponse?.listings || [];

  const cars = listings.map(item => {
    const priceType = item.priceInfo?.priceType || '';
    const isReserved = priceType === 'RESERVED' || item.reserved === true;
    const price = Math.round((item.priceInfo?.priceCents || 0) / 100);

    let year = 0, mileage = 0;
    for (const attr of item.attributes || []) {
      if (attr.key === 'constructionYear') year = parseInt(attr.value) || 0;
      if (attr.key === 'mileage') mileage = parseInt(attr.value) || 0;
    }

    const normalize = url => url.startsWith('//') ? `https:${url}` : url;
    const images = (item.pictures || [])
      .map(p => p.extraExtraLargeUrl || p.largeUrl || '')
      .filter(Boolean)
      .map(normalize);
    const imageUrl = images[0] || item.imageUrls?.[0] || '';
    // Skip leading year (e.g. "2020 DS7 Crossback...") but keep numeric models like "2008"
    const rawWords = item.title.trim().split(/\s+/);
    const words = (rawWords.length > 1 && /^\d{4}$/.test(rawWords[0])) ? rawWords.slice(1) : rawWords;
    const brand = normalizeBrand(words[0] || 'Unknown');
    const model = words[1] || '';

    return {
      id: item.itemId,
      brand,
      model,
      title: item.title,
      year,
      mileage,
      fuel: 'Onbekend',
      transmission: 'Onbekend',
      power: '',
      price,
      price_all_in: null,
      euro_norm: null,
      first_owner: item.title.toLowerCase().includes('eerste eigenaar'),
      warranty: '12 maanden',
      features: [],
      image: normalize(imageUrl),
      images,
      url: `https://www.2dehands.be${item.vipUrl}`,
      reserved: isReserved,
      last_updated: new Date().toISOString(),
      date_added: null,
    };
  });

  // Load existing DB state to decide what needs a VIP fetch
  const { data: existing } = await supabase
    .from('cars')
    .select('id, brand, images, fuel, transmission, power, euro_norm, model, price_all_in, date_added, features');
  const existingMap = Object.fromEntries((existing ?? []).map(r => [r.id, r]));
  const existingIds = new Set(Object.keys(existingMap));
  const newCars = cars.filter(c => !existingIds.has(c.id));

  // Fetch VIP page for: new cars, or cars still missing key data
  const fetchNeeded = cars.filter(c => {
    const prev = existingMap[c.id];
    if (!prev) return true;
    return !prev.model ||
           (prev.images?.length || 0) < 2 ||
           !prev.fuel || prev.fuel === 'Onbekend' ||
           !prev.transmission || prev.transmission === 'Onbekend' ||
           !prev.date_added ||
           !prev.features?.length;
  });

  if (fetchNeeded.length > 0) {
    for (const car of fetchNeeded) {
      try {
        const vipRes = await fetch(car.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html',
          }
        });
        const vipHtml = await vipRes.text();

        const configMatch = vipHtml.match(/window\.__CONFIG__\s*=\s*(\{[\s\S]*?\});\s*(?:window|<\/script>)/);
        if (!configMatch) continue;

        const config = JSON.parse(configMatch[1]);
        const listing = config?.listing || {};

        // Images
        const mediaImages = listing?.gallery?.media?.images || [];
        const allImages = mediaImages
          .map(img => img.base?.replace('#', '85'))
          .filter(Boolean)
          .map(u => u.startsWith('//') ? `https:${u}` : u);
        if (allImages.length > 0) {
          car.images = allImages;
          car.image = allImages[0];
        }

        // Attributes live in carAttributes.groupedWithIcons
        const allAttrs = (listing.carAttributes?.groupedWithIcons || [])
          .flatMap(g => g.attributes || []);
        const getAttr = key => {
          const a = allAttrs.find(a => a.key === key);
          return a ? (Array.isArray(a.values) && !a.value ? a.values : a.value) : null;
        };

        const fuel = getAttr('fuel');
        const transmission = getAttr('transmission');
        const euroNorm = getAttr('euronormBE');
        const options = allAttrs.find(a => a.key === 'options')?.values || [];

        if (fuel) car.fuel = String(fuel);
        if (transmission) car.transmission = String(transmission);
        if (euroNorm) car.euro_norm = String(euroNorm);
        if (options.length > 0) car.features = options;

        if (listing.carDetails?.brand) car.brand = normalizeBrand(listing.carDetails.brand);
        if (listing.carDetails?.model) car.model = listing.carDetails.model;
        if (listing.stats?.since) car.date_added = listing.stats.since;
        car._vipFetched = true;

      } catch {
        // keep whatever we already have
      }
    }
  }

  // Preserve DB values for fields that come from VIP (not the listing page)
  const carsToUpsert = cars.map(c => {
    const prev = existingMap[c.id];
    const vip = c._vipFetched;
    delete c._vipFetched;
    return {
      ...c,
      brand: vip ? c.brand : (prev?.brand || c.brand),
      model: vip ? (c.model || prev?.model || '') : (prev?.model || c.model || ''),
      price_all_in: prev?.price_all_in ?? c.price_all_in,
      power: c.power || prev?.power || '',
      euro_norm: c.euro_norm || prev?.euro_norm || null,
      // Only overwrite fuel/transmission if VIP provided a real value; otherwise keep DB value
      fuel: (c.fuel && c.fuel !== 'Onbekend') ? c.fuel : (prev?.fuel || c.fuel),
      transmission: (c.transmission && c.transmission !== 'Onbekend') ? c.transmission : (prev?.transmission || c.transmission),
      images: c.images?.length ? c.images : (prev?.images ?? c.images),
      features: c.features?.length ? c.features : (prev?.features ?? c.features),
      // Use 2dehands listing date (stats.since) if available, otherwise keep existing DB value
      date_added: c.date_added || prev?.date_added || new Date().toISOString(),
    };
  });

  const { error } = await supabase
    .from('cars')
    .upsert(carsToUpsert, { onConflict: 'id' });

  if (error) throw error;

  // Remove cars from DB that are no longer on 2dehands (re-listed or deleted)
  const liveIds = new Set(cars.map(c => c.id));
  const staleIds = (existing ?? []).filter(r => !liveIds.has(r.id)).map(r => r.id);
  if (staleIds.length > 0) {
    await supabase.from('cars').delete().in('id', staleIds);
  }

  if (newCars.length > 0 && process.env.RESEND_API_KEY) {
    await notifySubscribers(newCars);
  }
}

async function scrapeReviews() {
  // Try the feedback subpage first, fall back to profile root
  const urls = [
    'https://www.2dehands.be/u/mv-motors/35556286/feedback/',
    'https://www.2dehands.be/u/mv-motors/35556286/reviews/',
    'https://www.2dehands.be/u/mv-motors/35556286/',
  ];

  let pageProps = {};
  for (const url of urls) {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      }
    });
    const html = await res.text();
    const $ = load(html);
    const nextDataScript = $('#__NEXT_DATA__').html();
    if (!nextDataScript) continue;
    const nextData = JSON.parse(nextDataScript);
    pageProps = nextData.props?.pageProps || {};
    // Stop if this page has feedback data
    const hasFeedback =
      pageProps.sellerProfile?.feedback?.feedbackItems?.length ||
      pageProps.profile?.feedback?.feedbackItems?.length ||
      pageProps.feedbackItems?.length ||
      pageProps.feedback?.feedbackItems?.length ||
      pageProps.sellerFeedback?.feedbackItems?.length;
    if (hasFeedback) break;
  }

  const rawReviews =
    pageProps.sellerProfile?.feedback?.feedbackItems ||
    pageProps.profile?.feedback?.feedbackItems ||
    pageProps.sellerFeedback?.feedbackItems ||
    pageProps.feedbackItems ||
    pageProps.feedback?.feedbackItems ||
    [];

  if (!rawReviews.length) {
    console.log('ℹ️  No reviews found in __NEXT_DATA__ — keys:', Object.keys(pageProps));
    console.log('ℹ️  Full pageProps (first level):', JSON.stringify(pageProps, null, 2).slice(0, 2000));
    return;
  }

  const getInitials = name => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const reviews = rawReviews.map(r => {
    const name = r.reviewerName || r.name || r.buyerName || 'Anoniem';
    return {
      id: String(r.id || r.feedbackId || `${name}-${r.date}`),
      reviewer_name: name,
      reviewer_initials: getInitials(name),
      reviewer_avatar: r.reviewerAvatar || r.avatarUrl || r.imageUrl || null,
      rating: r.rating || r.score || 0,
      text: r.text || r.description || r.comment || null,
      date: r.date || r.createdAt || null,
      source: '2dehands',
    };
  });

  const { error } = await supabase
    .from('reviews')
    .upsert(reviews, { onConflict: 'id' });

  if (error) throw error;
  console.log(`⭐  Synced ${reviews.length} review(s) to Supabase`);
}

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
const DAY_MS = 24 * 60 * 60 * 1000;

scrapeAndSync().catch(err => console.error('Initial sync failed:', err));
setInterval(() => scrapeAndSync().catch(err => console.error('Sync failed:', err)), SYNC_INTERVAL);

scrapeReviews().catch(err => console.error('Initial reviews sync failed:', err));
setInterval(() => scrapeReviews().catch(err => console.error('Reviews sync failed:', err)), DAY_MS);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, '0.0.0.0');
