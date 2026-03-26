# MV Motors Website 🚗

A modern, responsive car dealership website for MV Motors (Mechelen, Belgium). Features real-time inventory sync with 2dehands.be.

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4.2-blue) ![Vite](https://img.shields.io/badge/Vite-7.3-purple)

## ✨ Features

- **Live Inventory Sync** - Automatically fetches cars from 2dehands.be every 30 seconds
- **Reserved Status** - Cars marked as reserved show a "Gereserveerd" overlay with reduced opacity
- **Smart Filtering** - Filter by brand, sort by price/year/mileage, show only available cars
- **Email Notifications** - Secure newsletter signup via Supabase (GDPR compliant)
- **Responsive Design** - Looks great on desktop, tablet, and mobile
- **Dark Theme** - Sleek dark UI with gold accents

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4
- **Backend API:** Node.js + Express (scrapes 2dehands.be)
- **Database:** Supabase (for email subscriptions)

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx       # Navigation header
│   ├── Hero.tsx         # Hero section
│   ├── CarCard.tsx      # Individual car card
│   ├── Filters.tsx      # Filter controls
│   ├── Newsletter.tsx   # Email signup form
│   ├── About.tsx        # About section
│   ├── Contact.tsx      # Contact info
│   └── Footer.tsx       # Site footer
├── hooks/
│   └── useCars.ts       # Custom hook for fetching cars
├── lib/
│   └── supabase.ts      # Supabase client
├── types/
│   └── index.ts         # TypeScript interfaces
└── App.tsx              # Main app component

api/
├── server.mjs           # Express API server
└── scrape-2dehands.mjs  # Standalone scraper script
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mv-motors.git
cd mv-motors

# Install dependencies
npm install

# Start the API server (in one terminal)
node api/server.mjs

# Start the dev server (in another terminal)
npm run dev
```

### Environment Variables

Create a `.env` file for Supabase (optional, for email subscriptions):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run scrape` | Run 2dehands scraper manually |

## 🔧 Configuration

### API Caching

The API server caches 2dehands data for 30 seconds to avoid rate limiting. Adjust `CACHE_TTL` in `api/server.mjs` if needed.

### Vite Proxy

The Vite dev server proxies `/api` requests to the Express backend. See `vite.config.ts`.

## 🔒 Security

- Email subscriptions use Supabase with Row Level Security
- Visitors can only INSERT emails, not read the subscribers table
- No sensitive data stored in public files

## 📄 License

MIT

---

**MV Motors** - Kwaliteitsvoertuigen in Mechelen 🇧🇪
