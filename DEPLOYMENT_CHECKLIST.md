# CodeLens AI — Production Deployment Checklist

Follow this checklist step-by-step when deploying CodeLens AI to production on Vercel, Supabase, Clerk, and Sentry.

---

## 1. Vercel Dashboard Environment Variables Configuration
Ensure all client-safe and server-only environment variables are registered in your Vercel Project Settings (**Settings > Environment Variables**):

| Key | Type | Description |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Client-safe | Production Clerk Publishable Key (`pk_live_...`) |
| `CLERK_SECRET_KEY` | Server secret | Production Clerk Secret Key (`sk_live_...`) |
| `CLERK_WEBHOOK_SECRET` | Server secret | Production Svix Webhook Signing Secret (`whsec_...`) |
| `GEMINI_API_KEY` | Server secret | Google AI Studio API Key |
| `GEMINI_MODEL` | Server config | Gemini model ID (e.g. `gemini-2.5-flash`) |
| `DATABASE_URL` | Server secret | Supabase Transaction Pooler connection string (**Port 6543**) |
| `DIRECT_DATABASE_URL` | Server secret | Supabase Direct Session connection string (**Port 5432**) |
| `SENTRY_DSN` | Server secret | Backend Sentry DSN URL |
| `VITE_SENTRY_DSN` | Client-safe | Frontend Sentry DSN URL |

---

## 2. Database Migrations Execution
Run all Drizzle migrations against your production Supabase database instance prior to deploying code:

```bash
# Set production direct connection string in local environment
export DIRECT_DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].supabase.co:5432/postgres"

# Execute DDL migrations
npm run db:migrate
```

---

## 3. Register Webhook Endpoint in Clerk Dashboard
1. Open the [Clerk Dashboard](https://dashboard.clerk.com/) and select your Production application.
2. Navigate to **Webhooks** and click **+ Add Endpoint**.
3. Set **Endpoint URL** to `https://<your-vercel-domain>.vercel.app/api/webhooks/clerk`.
4. Subscribe to events:
   - `user.created`
   - `user.deleted`
5. Copy the production **Signing Secret** (`whsec_...`) and save it to Vercel's environment variables as `CLERK_WEBHOOK_SECRET`.

---

## 4. Clerk Production Instance & Custom Domain Setup
1. In Clerk Dashboard, switch your application instance from **Development** to **Production**.
2. Update your API keys on Vercel from `pk_test_...` / `sk_test_...` to `pk_live_...` / `sk_live_...`.
3. If using a custom domain (e.g., `auth.yourdomain.com`), complete DNS CNAME verification in Clerk settings.

---

## 5. Validate Free-Tier Gemini Model ID at Deployment Time
Confirm that the requested model identifier (e.g. `gemini-2.5-flash` or `gemini-1.5-flash`) is currently active and supported in your region via [Google AI Studio](https://aistudio.google.com/). Update `GEMINI_MODEL` on Vercel if model availability changes.

---

## 6. Sentry Environment & Release Tracking
1. Ensure `SENTRY_DSN` and `VITE_SENTRY_DSN` are set in production environment variables.
2. Verify in Sentry Dashboard under **Projects > CodeLens AI** that errors are categorized under `environment: production`.
