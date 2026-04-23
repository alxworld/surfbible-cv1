# Environment Setup — Step by Step

Everything here is a manual one-time action. Do them in order.

---

## Step 1 — Create a Vercel project (if not done)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New → Project**
3. Import this repo (GitHub / GitLab / Bitbucket)
4. Set **Root Directory** to `web`
5. Click **Deploy** (the first deploy will fail — that's fine, you just need the project to exist so you can attach integrations)

---

## Step 2 — Provision Neon database

1. In your Vercel project dashboard, go to **Storage** tab (left sidebar)
2. Click **Create Database**
3. Choose **Neon** → click **Continue**
4. Select region closest to your users (e.g. `ap-south-1` for India)
5. Click **Create**
6. Vercel auto-adds these env vars to your project:
   - `DATABASE_URL`
   - `DATABASE_URL_UNPOOLED`
   - `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
7. Pull them to your local machine:
   ```bash
   cd web
   vercel link        # links local folder to your Vercel project (one-time)
   vercel env pull .env.local
   ```
8. Verify `.env.local` now contains `DATABASE_URL=postgresql://...`

---

## Step 3 — Create the database tables and seed data

From the `web/` directory:

```bash
# Push the Drizzle schema to Neon (creates all 9 tables)
npm run db:push

# Insert the Navigators Bible Reading Plan (300 days)
npm run db:seed
```

Expected output for `db:seed`:
```
Seeding Navigators Bible Reading Plan...
Created plan: <some-uuid>
Inserted 300 days.
```

---

## Step 4 — Set up Clerk authentication

1. Go to [clerk.com](https://clerk.com) → **Sign up** (free)
2. Click **Create application**
3. Enter application name: `SurfBible`
4. Choose sign-in options: **Email** + **Google** (recommended)
5. Click **Create application**
6. You land on the API Keys page. Copy:
   - **Publishable key** → starts with `pk_test_...`
   - **Secret key** → starts with `sk_test_...`
7. Open `web/.env.local` and add:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   CLERK_SECRET_KEY=sk_test_...
   ```
8. In your Vercel project → **Settings → Environment Variables**, add the same 4 keys for **Production** + **Preview** environments

---

## Step 5 — Get an ESV Bible API key

1. Go to [api.esv.org](https://api.esv.org) → click **Sign up**
2. Create a free account
3. Go to **API Tokens** → click **Create token**
4. Name it `SurfBible`
5. Copy the token
6. Add to `web/.env.local`:
   ```
   ESV_API_KEY=Token <paste-token-here>
   ```
7. Add the same key to Vercel → **Settings → Environment Variables**

---

## Step 6 — Verify everything works locally

```bash
cd web
npm run dev
```

Open [http://localhost:3000/api/plans](http://localhost:3000/api/plans) in your browser.

You should see a JSON response with the Navigators plan:
```json
[
  {
    "id": "...",
    "title": "The Navigators Bible Reading Plan",
    "type": "navigators",
    "totalDays": 300,
    ...
  }
]
```

If you see an empty array `[]`, re-run `npm run db:seed`.  
If you see a connection error, check `DATABASE_URL` in `.env.local`.

---

## Step 7 — Confirm your .env.local is complete

Your `web/.env.local` should contain all of these:

```
# Neon (auto-filled by vercel env pull)
DATABASE_URL=postgresql://...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_SECRET_KEY=sk_test_...

# ESV Bible API
ESV_API_KEY=Token ...
```

Once all 7 items above are checked off, you are ready to start Phase 1.0 feature development.  
See `docs/phase-1.0.md` for the next coding steps.
