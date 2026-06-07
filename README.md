# MiniERP — Phase 6: Settings, Polish & Deployment

## What's included

- ✅ Business Settings page (profile, currency, tax rate)
- ✅ Team management (view members, change roles, remove)
- ✅ Role-based access guard on settings page (admin only)
- ✅ `loading.tsx` skeleton screens for every dashboard route
- ✅ `error.tsx` error boundary for dashboard
- ✅ `not-found.tsx` global 404 page
- ✅ SVG favicon
- ✅ Complete SEO metadata + Open Graph + Twitter card
- ✅ Viewport theme color (dark/light)
- ✅ `vercel.json` with security headers
- ✅ Updated `next.config.ts` (removed deprecated experimental flag)
- ✅ Updated root `layout.tsx` with Toaster `closeButton`

## Files to merge

```
src/
├── app/
│   ├── layout.tsx                        ← REPLACE
│   ├── not-found.tsx                     ← NEW
│   └── dashboard/
│       ├── error.tsx                     ← NEW
│       ├── loading.tsx                   ← NEW
│       ├── settings/
│       │   ├── page.tsx                  ← REPLACE placeholder
│       │   └── loading.tsx               ← NEW
│       ├── inventory/loading.tsx         ← NEW
│       ├── pos/loading.tsx               ← NEW
│       ├── sales/loading.tsx             ← NEW
│       ├── customers/loading.tsx         ← NEW
│       ├── expenses/loading.tsx          ← NEW
│       └── reports/loading.tsx           ← NEW
├── components/settings/
│   ├── BusinessProfileForm.tsx           ← NEW
│   └── TeamMembers.tsx                   ← NEW
└── lib/actions/
    └── settings.ts                       ← NEW

vercel.json                               ← NEW (project root)
next.config.ts                            ← REPLACE
public/favicon.svg                        ← NEW
```

## Deploying to Vercel

1. Push to GitHub:
```bash
git init
git add .
git commit -m "MiniERP initial commit"
git remote add origin https://github.com/your-username/minierp.git
git push -u origin main
```

2. Go to [vercel.com/new](https://vercel.com/new) → Import repository

3. Add environment variables in Vercel dashboard:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL   (your vercel URL, e.g. https://minierp.vercel.app)
```

4. In Supabase Dashboard → Auth → URL Configuration, add:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`

5. Deploy — Vercel auto-deploys on every `git push`

## All 6 phases complete ✓

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ | Project setup, auth, landing page |
| 2 | ✅ | Dashboard shell, sidebar, navigation |
| 3 | ✅ | Inventory management |
| 4 | ✅ | POS, sales, customers |
| 5 | ✅ | Reports, analytics, expenses |
| 6 | ✅ | Settings, polish, deployment |
