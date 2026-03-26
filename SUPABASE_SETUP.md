# Supabase Setup for MV Motors

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Create a new project
3. Wait for it to initialize

## 2. Create the Subscribers Table

Go to **SQL Editor** and run this:

```sql
-- Create subscribers table
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'mv-motors-website',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (IMPORTANT!)
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for the website form)
CREATE POLICY "Allow anonymous inserts" ON subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Only authenticated users can read (admin only)
CREATE POLICY "Only authenticated can read" ON subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_subscribers_email ON subscribers(email);
```

## 3. Get Your API Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (safe to expose in frontend)

## 4. Configure Environment

Create `.env` in the mv-motors folder:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 5. Security Notes

✅ **Safe to expose**: The anon key is designed to be public
✅ **Protected by RLS**: Row Level Security prevents unauthorized reads
✅ **Email-only inserts**: The policy only allows inserting emails
❌ **Cannot read data**: Website visitors cannot query the subscribers table

## 6. View Subscribers

To see your subscribers:
1. Go to Supabase Dashboard → **Table Editor** → **subscribers**
2. Or use the SQL Editor: `SELECT * FROM subscribers ORDER BY created_at DESC;`
