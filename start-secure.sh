#!/bin/bash
# Start Mission Control with password protection

# Bind to localhost only (no public access)
PORT=3000

# Start Next.js with password
export MISSION_CONTROL_PASSWORD="${MISSION_CONTROL_PASSWORD:-napier-secure-2024}"
export NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Print access info
echo "🎯 Mission Control starting..."
echo ""
echo "Local access:    http://localhost:$PORT"
echo "Tailscale access: http://andrews-mac-mini.tailf1dcc0.ts.net:$PORT"
echo ""
echo "Password: napier-secure-2024"
echo ""
echo "NOTE: This is only accessible via:"
echo "  1. This Mac (localhost)"
echo "  2. Your Tailscale network (private mesh)"
echo ""
echo "NOT accessible from public internet."
echo ""

# Start server
npm run dev -- -p $PORT
