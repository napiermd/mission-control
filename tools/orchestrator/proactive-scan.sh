#!/usr/bin/env bash
set -euo pipefail

# Proactive Work Finder - Scans for tasks and spawns agents
# Usage: bash tools/orchestrator/proactive-scan.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OBSIDIAN_VAULT="/Users/andrewbot/Library/Mobile Documents/iCloud~md~obsidian/Documents/Tri-Vault"

echo "🔍 Proactive Work Finder — $(date)"
echo ""

FOUND_TASKS=0

# 1. Scan Meeting Notes for Feature Requests
echo "→ Scanning meeting notes..."
python3 - <<'PY' "$OBSIDIAN_VAULT"
import sys, os, re
from pathlib import Path
from datetime import datetime, timedelta

vault = Path(sys.argv[1])
meetings_dir = vault / "20 Meetings"

if not meetings_dir.exists():
    print("  ⚠️  Meetings directory not found")
    sys.exit(0)

# Look for recent meetings (last 7 days)
cutoff = datetime.now() - timedelta(days=7)
feature_requests = []

for md_file in meetings_dir.rglob('*.md'):
    try:
        mtime = datetime.fromtimestamp(md_file.stat().st_mtime)
        if mtime < cutoff:
            continue
        
        content = md_file.read_text(encoding='utf-8', errors='ignore')
        
        # Look for action items or feature requests
        patterns = [
            r'(?i)feature request[:\s]+(.+)',
            r'(?i)action item[:\s]+(.+)',
            r'(?i)todo[:\s]+(.+)',
            r'(?i)build[:\s]+(.+)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, content, re.MULTILINE)
            for match in matches:
                feature_requests.append({
                    'source': 'meeting',
                    'file': str(md_file.name),
                    'task': match.strip()[:100]
                })
    except Exception:
        pass

if feature_requests:
    print(f"  Found {len(feature_requests)} potential feature requests:")
    for req in feature_requests[:3]:  # Show top 3
        print(f"    - {req['file']}: {req['task'][:60]}...")

    with open('/tmp/proactive-feature-requests.json', 'w') as f:
        import json
        json.dump(feature_requests, f, indent=2)
else:
    print("  No new feature requests found")
PY

# 2. Scan GitHub Issues
echo ""
echo "→ Scanning GitHub issues..."
if command -v gh &> /dev/null; then
  ISSUES=$(gh issue list --repo napiermd/mission-control --state open --label "bug" --limit 5 --json number,title,labels 2>/dev/null || echo "[]")
  
  ISSUE_COUNT=$(echo "$ISSUES" | jq '. | length')
  
  if [ "$ISSUE_COUNT" -gt 0 ]; then
    echo "  Found $ISSUE_COUNT open bug issues:"
    echo "$ISSUES" | jq -r '.[] | "    - #\(.number): \(.title[:60])"'
    
    echo "$ISSUES" > /tmp/proactive-github-issues.json
    FOUND_TASKS=$((FOUND_TASKS + ISSUE_COUNT))
  else
    echo "  No open bug issues"
  fi
else
  echo "  ⚠️  gh CLI not installed, skipping GitHub scan"
fi

# 3. Scan Sentry (placeholder - requires Sentry API setup)
echo ""
echo "→ Scanning Sentry for errors..."
echo "  ⚠️  Sentry integration not configured yet"
echo "  To enable:"
echo "    1. Get Sentry API token"
echo "    2. Add to ~/.clawdbot/config.json"
echo "    3. Uncomment Sentry scan code"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Scan Summary"
echo ""

if [ -f /tmp/proactive-feature-requests.json ]; then
  FEATURE_COUNT=$(jq '. | length' /tmp/proactive-feature-requests.json)
  echo "Feature requests: $FEATURE_COUNT"
  FOUND_TASKS=$((FOUND_TASKS + FEATURE_COUNT))
fi

if [ -f /tmp/proactive-github-issues.json ]; then
  ISSUE_COUNT=$(jq '. | length' /tmp/proactive-github-issues.json)
  echo "GitHub issues: $ISSUE_COUNT"
fi

echo "Sentry errors: 0 (not configured)"
echo ""

if [ $FOUND_TASKS -gt 0 ]; then
  echo "✅ Found $FOUND_TASKS tasks"
  echo ""
  echo "Next steps:"
  echo "  - Review tasks in /tmp/proactive-*.json"
  echo "  - To auto-spawn agent for a task:"
  echo "    bash tools/orchestrator/spawn.sh \"<task description>\""
  echo ""
  echo "Or enable auto-spawn in orchestrator config (use with caution!)"
else
  echo "✅ No new tasks found. System is clean."
fi

echo ""
echo "PROACTIVE_SCAN_OK found=$FOUND_TASKS"
