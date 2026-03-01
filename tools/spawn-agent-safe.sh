#!/usr/bin/env bash
set -euo pipefail

# Spawn a coding agent in an isolated git worktree
# Usage: bash tools/spawn-agent-safe.sh "task description"

TASK_DESC="$1"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TASK_ID="agent-${TIMESTAMP}"
WORKTREE_DIR="/tmp/mission-control-${TASK_ID}"
BRANCH="agent/${TASK_ID}"

echo "🚀 Spawning isolated agent: $TASK_ID"
echo "Task: $TASK_DESC"
echo ""

# Create isolated worktree
echo "→ Creating worktree at $WORKTREE_DIR"
git worktree add "$WORKTREE_DIR" -b "$BRANCH"

echo "→ Worktree created. Agent will work in isolation."
echo ""

# Save task metadata
mkdir -p ~/.clawdbot
TASK_REGISTRY=~/.clawdbot/active-tasks.json

# Initialize registry if it doesn't exist
if [ ! -f "$TASK_REGISTRY" ]; then
  echo "[]" > "$TASK_REGISTRY"
fi

# Add task to registry
TASK_JSON=$(cat <<TASKEOF
{
  "id": "$TASK_ID",
  "branch": "$BRANCH",
  "worktree": "$WORKTREE_DIR",
  "task": "$TASK_DESC",
  "started_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "running",
  "tmux_session": null,
  "pr_number": null
}
TASKEOF
)

python3 - <<'PY' "$TASK_REGISTRY" "$TASK_JSON"
import json, sys
registry_file = sys.argv[1]
new_task = json.loads(sys.argv[2])

with open(registry_file, 'r') as f:
    tasks = json.load(f)

tasks.append(new_task)

with open(registry_file, 'w') as f:
    json.dump(tasks, f, indent=2)

print(f"✅ Task {new_task['id']} registered")
PY

echo ""
echo "✅ Ready to spawn agent"
echo ""
echo "Next steps:"
echo "  cd $WORKTREE_DIR"
echo "  codex exec '$TASK_DESC'"
echo ""
echo "Or run in tmux:"
echo "  tmux new-session -d -s $TASK_ID \"cd $WORKTREE_DIR && codex exec --full-auto '$TASK_DESC'\""
echo ""
echo "Monitor: tmux attach -t $TASK_ID"
echo "Cleanup: git worktree remove $WORKTREE_DIR"
