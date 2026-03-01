#!/usr/bin/env bash
set -e

echo "🔍 Checking PR readiness..."

# Run all quality checks
echo "→ Lint..."
npm run lint

echo "→ Type check..."
npm run typecheck

echo "→ Tests..."
npm test

echo "→ Build..."
npm run build

# Check for UI changes requiring screenshots
if git diff --name-only HEAD~1 2>/dev/null | grep -E '\.(tsx|ts|css|jsx|js)$' > /dev/null; then
  echo "→ Checking for screenshots in PR description..."
  
  # Try to get PR body (requires gh CLI)
  if command -v gh &> /dev/null; then
    PR_BODY=$(gh pr view --json body --jq .body 2>/dev/null || echo "")
    
    if [ -n "$PR_BODY" ]; then
      # Check for image markdown syntax
      if ! echo "$PR_BODY" | grep -q '!\[.*\](.*\.(png|jpg|jpeg|gif))'; then
        echo "⚠️  UI files changed but no screenshots found in PR description"
        echo "   Please add screenshots showing the changes"
        exit 1
      fi
    else
      echo "⚠️  Could not fetch PR body. Skipping screenshot check."
    fi
  else
    echo "⚠️  gh CLI not installed. Skipping screenshot check."
  fi
fi

echo "✅ PR is ready for review"
