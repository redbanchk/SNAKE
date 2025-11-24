<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1R8oMBsU8olHUWcfsbaDX2cl6trA8dUjb

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create `.env.local` and set Supabase credentials:
   - `VITE_SUPABASE_URL=https://<project>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=sb_publishable_...` (or legacy anon key)
   Notes:
   - Keys must be prefixed with `VITE_` to be exposed to the client at build time
   - Do not commit `.env*` (already ignored by `.gitignore`)
3. Run the app:
   `npm run dev`

### Production (Vercel)
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Environment Variables (All Environments)
- Trigger a redeploy; ensure the site serves the built `dist` output (Vite)

### Troubleshooting
- Login modal shows “Supabase 未配置”:
  - Check env variable names include `VITE_` prefix
  - Verify build uses Vite (`npm run build`) and deploys `dist`
  - Inspect console: we log `{ hasUrl, hasKey }` booleans for Supabase config
  - In Supabase Dashboard, enable Email/Password provider and set Redirect URLs
