#!/usr/bin/env bash
set -euo pipefail

# Clean up completed/failed agent worktrees and update registry
# Run daily via cron

TASK_REGISTRY=~/.clawdbot/active-tasks.json

if [ ! -f "$TASK_REGISTRY" ]; then
  echo "CLEANUP_OK no_registry"
  exit 0
fi

echo "🧹 Agent Cleanup — $(date)"
echo ""

python3 - <<'PY' "$TASK_REGISTRY"
import json, sys, subprocess, os
from datetime import datetime, timedelta

registry_file = sys.argv[1]

with open(registry_file, 'r') as f:
    tasks = json.load(f)

now = datetime.utcnow()
cleaned = 0
kept = 0

new_tasks = []

for task in tasks:
    task_id = task['id']
    status = task.get('status', 'unknown')
    worktree = task.get('worktree')
    started = task.get('started_at')
    
    # Parse started time
    try:
        started_dt = datetime.fromisoformat(started.replace('Z', '+00:00'))
    except:
        started_dt = now - timedelta(days=999)  # Very old
    
    age_hours = (now - started_dt.replace(tzinfo=None)).total_seconds() / 3600
    
    # Cleanup criteria:
    # - Completed/failed tasks older than 24h
    # - Running tasks older than 7 days (likely stuck)
    should_cleanup = False
    
    if status in ['completed', 'failed'] and age_hours > 24:
        should_cleanup = True
        reason = f"status={status}, age={age_hours:.1f}h"
    elif status == 'running' and age_hours > 168:  # 7 days
        should_cleanup = True
        reason = f"stuck, age={age_hours:.1f}h"
    
    if should_cleanup:
        print(f"→ Cleaning {task_id} ({reason})")
        
        # Remove worktree if it exists
        if worktree and os.path.exists(worktree):
            try:
                subprocess.run(['git', 'worktree', 'remove', worktree, '--force'],
                               capture_output=True, timeout=10)
                print(f"  ✅ Removed worktree")
            except Exception as e:
                print(f"  ⚠️  Could not remove worktree: {e}")
        
        cleaned += 1
    else:
        new_tasks.append(task)
        kept += 1

print("")
print(f"Summary: cleaned {cleaned}, kept {kept}")

# Write updated registry
with open(registry_file, 'w') as f:
    json.dump(new_tasks, f, indent=2)

print(f"CLEANUP_OK cleaned={cleaned} kept={kept}")
PY
