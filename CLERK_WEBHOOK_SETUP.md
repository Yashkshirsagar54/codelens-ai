# Clerk Webhook Setup Guide for CodeLens AI

To synchronize user account creations and deletions with your Supabase database in real-time, configure a webhook endpoint in the Clerk Dashboard.

---

## 1. Webhook Endpoint URL

- **Production URL**: `https://<your-vercel-domain>.vercel.app/api/webhooks/clerk`
- **Development URL**: Use [ngrok](https://ngrok.com) or [localtunnel](https://localtunnel.github.io/www/) to forward `http://localhost:3001/api/webhooks/clerk` during local testing.

---

## 2. Configuration Steps in Clerk Dashboard

1. Log in to the [Clerk Dashboard](https://dashboard.clerk.com/).
2. Select your application.
3. In the sidebar, navigate to **Webhooks**.
4. Click **+ Add Endpoint**.
5. Set **Endpoint URL** to `https://<your-vercel-domain>.vercel.app/api/webhooks/clerk`.
6. Under **Subscribe to events**, select the following mandatory events:
   - `user.created` (Fired when a user registers)
   - `user.deleted` (Fired when a user deletes their account)
7. Click **Create**.

---

## 3. Copy Signing Secret to Environment Variables

1. After creating the endpoint, locate the **Signing Secret** section (starts with `whsec_...`).
2. Copy the signing secret.
3. Add it to your `.env` (for local development) and Vercel Environment Variables (for production):
   ```env
   CLERK_WEBHOOK_SECRET=whsec_...
   ```
