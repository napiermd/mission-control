# Mission Control

## Setup (Supabase)

1) Create tables:
- Run `supabase/schema.sql` in Supabase SQL editor.
- Optionally run `supabase/seed.sql`.

2) Configure env vars in Vercel:
- `MISSION_CONTROL_PASSWORD`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

3) Deploy:
```bash
vercel deploy --prod
```

## Local
```bash
npm install
npm run dev
```
