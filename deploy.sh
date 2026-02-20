#!/bin/bash
# Deploy Mission Control to Vercel with password protection

echo "🚀 Deploying Mission Control to Vercel"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Check for password
if [ -z "$MISSION_CONTROL_PASSWORD" ]; then
    echo "⚠️  Set MISSION_CONTROL_PASSWORD environment variable"
    echo "Example: MISSION_CONTROL_PASSWORD=your-secure-pass vercel --prod"
    exit 1
fi

# Deploy
echo "Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployed!"
echo "Set your password as an environment variable in Vercel dashboard:"
echo "  MISSION_CONTROL_PASSWORD=$MISSION_CONTROL_PASSWORD"
