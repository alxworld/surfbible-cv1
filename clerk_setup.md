# Clerk Production Setup for SurfBible

## Why this is needed

Clerk has two instance types:

| Instance | Keys | Works on |
|---|---|---|
| Development | `pk_test_*` / `sk_test_*` | `localhost` only |
| Production | `pk_live_*` / `sk_live_*` | your real domain |

The current deployment uses development keys, which is why the app shows an "Internal Server Error" with a `__clerk_handshake` loop on Vercel. Clerk's development instance refuses to authenticate sessions on non-localhost domains. The fix is a one-time production instance setup tied to `surfbible.in`.

---

## Step 1 — Create the Clerk Production Instance

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Open the **Surf Bible** app
3. At the top, click the **"Development"** environment dropdown
4. Select **"Create production instance"**
5. In the **Application domain** field enter: `surfbible.in` (not the vercel.app URL)
6. Click **Create Instance**

Clerk will now show you DNS records to verify you own the domain.

---

## Step 2 — Add Clerk DNS Records to Your Domain Registrar

Clerk needs to verify you own `surfbible.in`. It will show you records like:

| Type | Name | Value |
|---|---|---|
| CNAME | `clerk` | `frontend-api.clerk.services` |
| TXT | `clk._domainkey` | `(long string)` |

Add these at wherever `surfbible.in` is registered (GoDaddy, Namecheap, Cloudflare, etc.):

1. Log into your domain registrar
2. Go to DNS settings for `surfbible.in`
3. Add each record Clerk shows you exactly as listed
4. Save — DNS propagation can take 5–30 minutes

Back in Clerk dashboard, click **Verify DNS** once records are added. It will turn green when verified.

---

## Step 3 — Add surfbible.in as a Custom Domain in Vercel

Vercel also needs to serve the app on `surfbible.in`. Do this in parallel with the DNS step above.

1. Go to [vercel.com](https://vercel.com) → **surfbible-cv1** project
2. **Settings → Domains → Add**
3. Enter `surfbible.in` and click **Add**
4. Vercel will show you a DNS record (usually an A record or CNAME):

| Type | Name | Value |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Add these to your domain registrar DNS settings (same place as Step 2).

> If you use Cloudflare, set the proxy status to **DNS only** (grey cloud) for the Vercel A/CNAME records — Clerk's verification needs direct DNS, not proxied.

---

## Step 4 — Get New Production Keys from Clerk

Once the domain is verified in Clerk:

1. In Clerk dashboard (now in Production mode) → **Configure → API Keys**
2. Copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — starts with `pk_live_`
   - `CLERK_SECRET_KEY` — starts with `sk_live_`

---

## Step 5 — Update Vercel Environment Variables

Replace the old test keys with the live keys:

```bash
cd /home/alex/aiprj/sfb

# Remove old test keys
vercel env rm NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env rm CLERK_SECRET_KEY production

# Add new live keys (paste value when prompted)
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
```

Also update the app URL now that the real domain is live:

```bash
vercel env rm NEXT_PUBLIC_APP_URL production
echo "https://surfbible.in" | vercel env add NEXT_PUBLIC_APP_URL production
```

---

## Step 6 — Redeploy

```bash
cd /home/alex/aiprj/sfb
vercel --prod
```

---

## Step 7 — Verify

1. Open [https://surfbible.in](https://surfbible.in) — home page loads without error
2. Click **Sign Up** — Clerk sign-up form works
3. Click **Sign In** — Clerk sign-in form works
4. After signing in, **Dashboard** loads with today's reading

---

## Summary of DNS Records to Add

All DNS changes go to your registrar for `surfbible.in`. You will need to add:

- **From Clerk** (Step 2): CNAME for `clerk` subdomain + TXT for DKIM
- **From Vercel** (Step 3): A record for `@` + CNAME for `www`

The exact values come from the respective dashboards — do not use placeholder values from this doc.

---

## Adding Google Sign-In

### Development (localhost)

No Google Cloud setup needed. Clerk provides shared OAuth credentials for local testing.

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) → your app
2. **User & Authentication → Social Connections**
3. Toggle **Google** on
4. Leave the credentials fields empty (Clerk fills them automatically for dev)
5. Save — the Google button appears on your sign-in/sign-up pages immediately

### Production (surfbible.in)

Clerk's shared dev credentials do not work on production instances. You need your own Google OAuth app.

**Step 1 — Create a Google OAuth app**

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Select or create a project (e.g. "SurfBible")
3. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - Fill in app name (`SurfBible`), support email, and developer contact email
   - Scopes: add `email` and `profile` (the defaults)
   - Save and continue through to the end
4. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: e.g. `SurfBible Clerk`
   - Under **Authorized redirect URIs**, add the callback URL shown in your Clerk Dashboard
     (Clerk → Google settings → copy the URI — looks like `https://accounts.surfbible.in/v1/oauth_callback`)
   - Click **Create**
5. Copy the **Client ID** and **Client Secret**

**Step 2 — Add credentials to Clerk**

1. Clerk Dashboard → **User & Authentication → Social Connections → Google**
2. Toggle Google on (if not already)
3. Paste the **Client ID** and **Client Secret** from step above
4. Save

**Step 3 — Verify**

1. Open [https://surfbible.in/sign-in](https://surfbible.in/sign-in)
2. A **Continue with Google** button should appear
3. Complete a test sign-in — you should land on the dashboard

> No code changes are required. The `<SignIn>` and `<SignUp>` Clerk components automatically render all enabled social providers.
