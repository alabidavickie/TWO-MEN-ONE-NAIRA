# Bachs Payments — Setup & Go‑Live Guide

Real payments via **Bachs hosted checkout**, confirmed by a **signature‑verified
webhook**, with orders stored in **Firestore**. No Google billing required — the
backend runs on **Netlify Functions** (free), and Firebase is used only for
Firestore + admin login (free Spark plan).

```
Buyer details ─► /api/create-checkout (Netlify) ─► Bachs /v1/checkout-sessions ─► checkout_url
      browser redirected to Bachs ─► buyer pays
      Bachs ─► /api/bachs-webhook (Netlify, HMAC‑verified) ─► marks registration "success" in Firestore
      browser (success_url) ─► /api/checkout-status ─► unlocks the download
```

## Architecture

| Piece | Runs on | Cost |
|---|---|---|
| Frontend (Vite build) | Netlify (static) | free |
| Backend: create-checkout, bachs-webhook, checkout-status | Netlify Functions | free |
| Database (registrations) + admin login | Firebase Firestore + Auth | free (Spark) |
| Payments | Bachs | per‑transaction fees |

The Bachs **secret key** and the Firebase **service account** live only in
Netlify environment variables — never in the browser or the repo.

---

## 1. Bachs sandbox

In your Bachs dashboard (org switcher → **Sandbox**):

1. **Product** — create "Two Men One Naira" with its price (e.g. `15.00 USD`).
   Copy the `prod_…` id. Keep `PRICE_PER_COPY` in `src/config.ts` matching it.
2. **API key** — Developer Portal → API Keys → *Create Secret Key*, scope
   **Payments: View + Create & charge**. Copy the `sk_sandbox_…` (shown once).
3. **Webhook** — added later (step 4), after Netlify gives you a URL.

---

## 2. Firebase (free — no billing)

1. **Service account key** (lets the Netlify functions write to Firestore):
   Firebase console → ⚙ Project settings → **Service accounts** →
   **Generate new private key** → downloads a JSON file.
2. **Base64‑encode it** (one line, so it pastes cleanly into Netlify):
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\serviceAccount.json")) | Set-Clipboard
   ```
   (macOS/Linux: `base64 -w0 serviceAccount.json`.) This is the value for
   `FIREBASE_SERVICE_ACCOUNT_B64` below.
3. **Admin login**: Authentication → Sign‑in method → enable **Email/Password**,
   then Users → **Add user** (your admin email + password).
4. **Deploy the Firestore rules** (free, no billing — just needs `firebase login`):
   ```powershell
   npx --yes firebase-tools deploy --only firestore:rules
   ```

> The Firebase Cloud Functions secret you may have set earlier
> (`BACHS_SECRET_KEY`) is no longer used and can be ignored — the backend is on
> Netlify now.

---

## 3. Deploy to Netlify + set environment variables

Deploy the site: push the repo to GitHub → Netlify → **Add new site → Import from
Git** (it reads `netlify.toml`: build `npm run build`, publish `dist`, functions
`netlify/functions`). Or `npm i -g netlify-cli && netlify deploy --prod`.

Then in Netlify → **Site configuration → Environment variables**, add:

| Variable | Value |
|---|---|
| `BACHS_SECRET_KEY` | `sk_sandbox_…` |
| `BACHS_BASE_URL` | `https://sandbox-api.bachs.io` |
| `BACHS_PRODUCT_ID` | `prod_…` (your book) |
| `APP_BASE_URL` | your Netlify site URL, e.g. `https://your-site.netlify.app` |
| `FIREBASE_SERVICE_ACCOUNT_B64` | the base64 string from step 2 |
| `BACHS_WEBHOOK_SECRET` | set in step 4 |

Redeploy after adding env vars (Netlify → Deploys → *Trigger deploy*), so the
functions pick them up.

---

## 4. Register the webhook

Your webhook URL is:

```
https://your-site.netlify.app/api/bachs-webhook
```

In Bachs → Developer Portal → **Webhooks → Add destination** = that URL.
Subscribe to **collection.succeeded** (also `collection.failed`,
`collection.underpaid`). Copy the **signing secret** `whsec_…`, add it as
`BACHS_WEBHOOK_SECRET` in Netlify (step 3), and trigger one more deploy.

---

## 5. Test in the sandbox

1. Open your Netlify site → pick copies → **Continue to Payment** → you should
   land on `checkout.bachs.io`.
2. Pay with a **Bachs sandbox test card** (the sandbox checkout shows a test‑card
   panel with success/failure cards).
3. You're redirected back with `?checkout_id=…`; the page polls and flips to
   **Payment Confirmed** when the webhook lands.
4. Sign in to the **Merchant Dashboard** (`/#admin`) — the row shows status
   `success` with the real amount. Check Bachs → **Events** for a 2xx delivery.

Debugging: Netlify → Functions → logs; Bachs → **Events** to inspect/retry any
delivery. Verify webhook signing with `npm run test:webhook`.

---

## 6. Go live (key swap)

1. Complete Bachs **verification** (product, identity, payout account) —
   <https://docs.bachs.io/go-live>.
2. In your **live** Bachs org: recreate the product, a **live** API key
   (`sk_live_…`), and a webhook (new `whsec_…`).
3. Update Netlify env vars: `BACHS_SECRET_KEY=sk_live_…`,
   `BACHS_BASE_URL=https://api.bachs.io`, `BACHS_PRODUCT_ID=<live>`,
   `BACHS_WEBHOOK_SECRET=<live>`, and redeploy.
4. Add your **custom domain** in Netlify (optional) and set `APP_BASE_URL` to it.
5. Firebase → Authentication → **Authorized domains** → add your Netlify/custom
   domain so admin login works there.
6. Put the real `Two_Men_One_Naira.pdf` in `public/` before building, so buyers
   get the actual file (not the text excerpt).

---

## Security notes

- **Secret key + service account** live only in Netlify env vars.
- **Webhook is the source of truth** — the browser can't mark an order paid; the
  Firestore `create` rule is `if false`, so only the server (Admin SDK) writes.
- **Signature + timestamp verified** on every webhook (HMAC‑SHA256, 5‑min
  tolerance); events de‑duplicated by `id`.
- Consider a lightweight rate limit / hCaptcha on `create-checkout` before
  launch to deter spam (App Check was Firebase‑Functions‑specific and no longer
  applies).
