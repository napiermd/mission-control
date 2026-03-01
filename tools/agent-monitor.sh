#!/usr/bin/env bash
set -euo pipefail

# Monitor active coding agents and auto-recover failures
# Run every 10 minutes via OpenClaw cron

TASK_REGISTRY=~/.clawdbot/active-tasks.json

if [ ! -f "$TASK_REGISTRY" ]; then
  echo "MONITOR_OK no_tasks"
  exit 0
fi

echo "🔍 Agent Monitor — $(date)"
echo ""

ISSUES=0
RESPAWNED=0

python3 - <<'PY' "$TASK_REGISTRY"
import json, sys, subprocess, os
from datetime import datetime

registry_file = sys.argv[1]

with open(registry_file, 'r') as f:
    tasks = json.load(f)

running_tasks = [t for t in tasks if t.get('status') == 'running']

if not running_tasks:
    print("✅ No active agents")
    sys.exit(0)

print(f"Active agents: {len(running_tasks)}")
print("")

issues = 0
respawned = 0

for task in running_tasks:
    task_id = task['id']
    tmux_session = task.get('tmux_session')
    pr_number = task.get('pr_number')
    worktree = task.get('worktree')
    
    print(f"→ {task_id}")
    
    # Check if tmux session is alive
    if tmux_session:
        result = subprocess.run(['tmux', 'has-session', '-t', tmux_session], 
                                capture_output=True)
        if result.returncode != 0:
            print(f"  ⚠️  tmux session died")
            issues += 1
            
            # Check how many times we've respawned
            attempts = task.get('respawn_attempts', 0)
            if attempts < 3:
                print(f"  → Respawn attempt {attempts + 1}/3")
                task['respawn_attempts'] = attempts + 1
                task['last_respawn'] = datetime.utcnow().isoformat() + 'Z'
                respawned += 1
                # Note: actual respawn would happen here
                # For now, just log it
            else:
                print(f"  ❌ Max respawn attempts reached. Marking failed.")
                task['status'] = 'failed'
    
    # Check if PR has failing CI
    if pr_number:
        try:
            result = subprocess.run([
                'gh', 'pr', 'view', str(pr_number),
                '--json', 'statusCheckRollup',
                '--jq', '.statusCheckRollup[0].state'
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                status = result.stdout.strip()
                if status == 'FAILURE':
                    print(f"  ⚠️  PR #{pr_number} CI failed")
                    issues += 1
                elif status == 'SUCCESS':
                    print(f"  ✅ PR #{pr_number} CI passed")
                    task['status'] = 'completed'
        except Exception as e:
            print(f"  ⚠️  Could not check PR status: {e}")

print("")
print(f"Summary: {issues} issues, {respawned} respawned")

# Write updated registry
with open(registry_file, 'w') as f:
    json.dump(tasks, f, indent=2)

if issues > 0:
    print(f"MONITOR_ALERT issues={issues} respawned={respawned}")
else:
    print(f"MONITOR_OK checked={len(running_tasks)}")
PY
