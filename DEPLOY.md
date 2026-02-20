# Mission Control Deployment Guide

## Environment Variables

Add these in Vercel dashboard:

```
MISSION_CONTROL_PASSWORD=napier-secure-2024
NEXT_PUBLIC_ENABLE_AUTH=true
```

## Auth Note

For Vercel serverless functions, we use client-side auth with localStorage + cookie fallback instead of server-side checking.
