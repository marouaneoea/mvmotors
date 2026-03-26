import { createClient } from 'npm:@supabase/supabase-js@2';

const BRAND_ALIASES: Record<string, string> = {
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

function normalizeBrand(brand: string): string {
  const key = brand.toLowerCase().trim();
  return BRAND_ALIASES[key] ?? brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

function buildEmailHtml(newCars: any[]) {
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

  return `<!DOCTYPE html>
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
    </html>`;
}

async function notifySubscribers(newCars: any[]) {
  const { data: subscribers, error } = await supabase.from('subscribers').select('email');
  if (error || !subscribers?.length) return;

  const html = buildEmailHtml(newCars);
  const subject = `${newCars.length} nieuwe wagen${newCars.length > 1 ? 's' : ''} bij MV Motors`;

  const batch = subscribers.map((sub: any) => ({
    from: Deno.env.get('RESEND_FROM'),
    to: sub.email,
    subject,
    html,
  }));

  await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(batch),
  });
}

async function scrapeAndSync() {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html',
  };

  const res = await fetch('https://www.2dehands.be/u/mv-motors/35556286/', { headers });
  const html = await res.text();

  // Extract __NEXT_DATA__ without cheerio (tag may have extra attributes like crossorigin)
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!nextDataMatch) throw new Error('Could not find listing data');

  const nextData = JSON.parse(nextDataMatch[1]);
  const listings = nextData.props?.pageProps?.searchRequestAndResponse?.listings || [];

  const normalize = (url: string) => url.startsWith('//') ? `https:${url}` : url;

  const cars = listings.map((item: any) => {
    const priceType = item.priceInfo?.priceType || '';
    const isReserved = priceType === 'RESERVED' || item.reserved === true;
    const price = Math.round((item.priceInfo?.priceCents || 0) / 100);

    let year = 0, mileage = 0;
    for (const attr of item.attributes || []) {
      if (attr.key === 'constructionYear') year = parseInt(attr.value) || 0;
      if (attr.key === 'mileage') mileage = parseInt(attr.value) || 0;
    }

    const images = (item.pictures || [])
      .map((p: any) => p.extraExtraLargeUrl || p.largeUrl || '')
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

  const { data: existing } = await supabase
    .from('cars')
    .select('id, brand, images, fuel, transmission, power, euro_norm, model, price_all_in, date_added, features');
  const existingMap = Object.fromEntries((existing ?? []).map((r: any) => [r.id, r]));
  const existingIds = new Set(Object.keys(existingMap));
  const newCars = cars.filter((c: any) => !existingIds.has(c.id));

  const fetchNeeded = cars.filter((c: any) => {
    const prev = existingMap[c.id];
    if (!prev) return true;
    return !prev.model ||
           (prev.images?.length || 0) < 2 ||
           !prev.fuel || prev.fuel === 'Onbekend' ||
           !prev.transmission || prev.transmission === 'Onbekend' ||
           !prev.date_added ||
           !prev.features?.length;
  });

  for (const car of fetchNeeded) {
    try {
      const vipRes = await fetch(car.url, { headers });
      const vipHtml = await vipRes.text();

      const configMatch = vipHtml.match(/window\.__CONFIG__\s*=\s*(\{[\s\S]*?\});\s*(?:window|<\/script>)/);
      if (!configMatch) continue;

      const config = JSON.parse(configMatch[1]);
      const listing = config?.listing || {};

      const mediaImages = listing?.gallery?.media?.images || [];
      const allImages = mediaImages
        .map((img: any) => img.base?.replace('#', '85'))
        .filter(Boolean)
        .map((u: string) => u.startsWith('//') ? `https:${u}` : u);
      if (allImages.length > 0) {
        car.images = allImages;
        car.image = allImages[0];
      }

      const allAttrs = (listing.carAttributes?.groupedWithIcons || [])
        .flatMap((g: any) => g.attributes || []);
      const getAttr = (key: string) => {
        const a = allAttrs.find((a: any) => a.key === key);
        return a ? (Array.isArray(a.values) && !a.value ? a.values : a.value) : null;
      };

      const fuel = getAttr('fuel');
      const transmission = getAttr('transmission');
      const euroNorm = getAttr('euronormBE');
      const options = allAttrs.find((a: any) => a.key === 'options')?.values || [];

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

  const carsToUpsert = cars.map((c: any) => {
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
      fuel: (c.fuel && c.fuel !== 'Onbekend') ? c.fuel : (prev?.fuel || c.fuel),
      transmission: (c.transmission && c.transmission !== 'Onbekend') ? c.transmission : (prev?.transmission || c.transmission),
      images: c.images?.length ? c.images : (prev?.images ?? c.images),
      features: c.features?.length ? c.features : (prev?.features ?? c.features),
      date_added: c.date_added || prev?.date_added || new Date().toISOString(),
    };
  });

  const { error } = await supabase.from('cars').upsert(carsToUpsert, { onConflict: 'id' });
  if (error) throw error;

  // Remove cars from DB that are no longer on 2dehands (re-listed or deleted)
  const liveIds = new Set(cars.map((c: any) => c.id));
  const staleIds = (existing ?? []).filter((r: any) => !liveIds.has(r.id)).map((r: any) => r.id);
  if (staleIds.length > 0) {
    await supabase.from('cars').delete().in('id', staleIds);
  }

  if (newCars.length > 0 && Deno.env.get('RESEND_API_KEY')) {
    await notifySubscribers(newCars);
  }
}

Deno.serve(async (req) => {
  // Only allow POST or scheduled invocations
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    await scrapeAndSync();
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Sync failed:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
