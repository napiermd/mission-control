#!/usr/bin/env bash
set -euo pipefail

echo "🚨 Emergency Vercel Rollback"
echo ""

# Get project name from vercel.json or use current directory name
PROJECT_NAME=$(jq -r '.name // empty' vercel.json 2>/dev/null || basename "$PWD")

echo "Project: $PROJECT_NAME"
echo ""

# List recent deployments
echo "Fetching recent deployments..."
DEPLOYMENTS=$(vercel list --json -t production 2>/dev/null | jq -r '.[0:5]')

if [ -z "$DEPLOYMENTS" ] || [ "$DEPLOYMENTS" = "null" ]; then
  echo "❌ No deployments found"
  exit 1
fi

# Show deployments
echo ""
echo "Recent deployments:"
echo "$DEPLOYMENTS" | jq -r 'to_entries | .[] | "\(.key + 1). \(.value.url) (commit: \(.value.meta.githubCommitSha // "unknown")[0:7])"'
echo ""

# Get second deployment (previous one)
PREV_URL=$(echo "$DEPLOYMENTS" | jq -r '.[1].url')
PREV_COMMIT=$(echo "$DEPLOYMENTS" | jq -r '.[1].meta.githubCommitSha // "unknown"')

if [ -z "$PREV_URL" ] || [ "$PREV_URL" = "null" ]; then
  echo "❌ No previous deployment found to rollback to"
  exit 1
fi

echo "Rolling back to: $PREV_URL"
echo "Commit: ${PREV_COMMIT:0:7}"
echo ""

read -p "Confirm rollback? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled"
  exit 0
fi

# Get production alias
PROD_ALIAS=$(vercel alias list --json 2>/dev/null | jq -r ".[0].alias")

if [ -z "$PROD_ALIAS" ] || [ "$PROD_ALIAS" = "null" ]; then
  echo "⚠️  No production alias found. Using project URL..."
  PROD_ALIAS="$PROJECT_NAME.vercel.app"
fi

# Rollback by aliasing previous deployment
echo "Setting alias..."
vercel alias set "$PREV_URL" "$PROD_ALIAS"

echo ""
echo "✅ Rolled back to $PREV_URL"
echo "   Production: https://$PROD_ALIAS"
