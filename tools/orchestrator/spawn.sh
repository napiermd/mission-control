#!/usr/bin/env bash
set -euo pipefail

# Orchestrator - Spawns agents with business context
# Usage: bash tools/orchestrator/spawn.sh "task description"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG="$SCRIPT_DIR/config.yaml"
TASK_DESC="$1"

echo "🧠 Orchestrator — Analyzing task"
echo "Task: $TASK_DESC"
echo ""

# Analyze task and build context
python3 - <<'PY' "$TASK_DESC" "$CONFIG"
import sys, yaml, json, os, re
from pathlib import Path
from datetime import datetime

task_desc = sys.argv[1]
config_file = sys.argv[2]

# Load config
with open(config_file, 'r') as f:
    config = yaml.safe_load(f)

orch = config['orchestrator']
vault_path = Path(orch['obsidian_vault']).expanduser()

print("→ Loading business context from Obsidian...")

# Search for relevant context
context_snippets = []
keywords = re.findall(r'\b\w{4,}\b', task_desc.lower())[:5]  # Top 5 keywords

for pattern in orch['context_sources']:
    pattern_path = pattern.replace('**/', '')
    search_dir = vault_path / pattern_path.split('/')[0]
    
    if not search_dir.exists():
        continue
    
    for md_file in search_dir.rglob('*.md'):
        try:
            content = md_file.read_text(encoding='utf-8', errors='ignore')
            # Simple keyword matching
            if any(kw in content.lower() for kw in keywords):
                # Extract first 200 chars of relevant section
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if any(kw in line.lower() for kw in keywords):
                        snippet = '\n'.join(lines[max(0, i-2):min(len(lines), i+3)])
                        context_snippets.append({
                            'file': str(md_file.relative_to(vault_path)),
                            'snippet': snippet[:200]
                        })
                        break
        except Exception:
            pass

# Classify task type
task_type = "feature_request"  # default
if any(w in task_desc.lower() for w in ['bug', 'fix', 'error', 'crash']):
    task_type = "bug_fix"
elif any(w in task_desc.lower() for w in ['refactor', 'clean', 'improve']):
    task_type = "refactor"
elif any(w in task_desc.lower() for w in ['design', 'ui', 'ux', 'layout']):
    task_type = "design_spec"

print(f"  Task type: {task_type}")
print(f"  Context snippets found: {len(context_snippets)}")

# Select agent
routing = orch['agent_routing']
if 'backend' in task_desc.lower() or 'api' in task_desc.lower():
    agent_config = routing['backend_logic']
elif 'ui' in task_desc.lower() or 'frontend' in task_desc.lower():
    agent_config = routing['frontend_ui']
elif task_type == 'bug_fix':
    agent_config = routing['bug_fix']
elif task_type == 'refactor':
    agent_config = routing['refactor']
else:
    agent_config = routing['backend_logic']  # default

print(f"  Agent: {agent_config['agent']}")
print(f"  Model: {agent_config['model']}")

# Build prompt with context
template = orch['prompt_templates'].get(task_type, orch['prompt_templates']['feature_request'])

# Inject context
customer_context = '\n'.join([f"- {s['file']}: {s['snippet']}" for s in context_snippets[:3]])

prompt = template.format(
    customer_context=customer_context or "No recent customer context found",
    requirements=task_desc,
    constraints="- Follow existing code style\n- Add tests\n- No breaking changes",
    task_description=task_desc,
    bug_description=task_desc if task_type == 'bug_fix' else "N/A",
    error_context="See task description",
    file_paths="Will be determined by agent",
    refactor_reason=task_desc if task_type == 'refactor' else "N/A"
)

# Output agent command
agent_cli = agent_config['agent']
if agent_cli == 'codex':
    agent_cmd = 'codex'
elif agent_cli == 'claude':
    agent_cmd = 'claude'
elif agent_cli == 'gemini':
    agent_cmd = 'gemini'
else:
    agent_cmd = 'codex'

flags = ' '.join(agent_config['flags'])

print("")
print("→ Generated prompt with business context")
print(f"  Prompt length: {len(prompt)} chars")
print("")

# Save to temp file for spawn script
spawn_data = {
    'agent_cmd': agent_cmd,
    'flags': flags,
    'prompt': prompt,
    'task_type': task_type,
    'context_count': len(context_snippets)
}

with open('/tmp/orchestrator-spawn-data.json', 'w') as f:
    json.dump(spawn_data, f, indent=2)

print("✅ Ready to spawn agent with enriched context")
PY

# Read spawn data
SPAWN_DATA=$(cat /tmp/orchestrator-spawn-data.json)
AGENT_CMD=$(echo "$SPAWN_DATA" | jq -r '.agent_cmd')
FLAGS=$(echo "$SPAWN_DATA" | jq -r '.flags')
PROMPT=$(echo "$SPAWN_DATA" | jq -r '.prompt')

# Spawn agent in isolated worktree
echo ""
echo "→ Spawning agent in isolated worktree..."
bash ~/mission-control/tools/spawn-agent-safe.sh "$TASK_DESC"

# Get latest task from registry
TASK_ID=$(jq -r '.[-1].id' ~/.clawdbot/active-tasks.json)
WORKTREE=$(jq -r '.[-1].worktree' ~/.clawdbot/active-tasks.json)

echo ""
echo "→ Starting agent in tmux session: $TASK_ID"

# Create prompt file in worktree
echo "$PROMPT" > "$WORKTREE/.agent-prompt.txt"

# Start agent in tmux
tmux new-session -d -s "$TASK_ID" "cd '$WORKTREE' && $AGENT_CMD exec $FLAGS \"$(cat '$WORKTREE/.agent-prompt.txt')\""

# Update registry with tmux session
python3 - <<'PY' "$TASK_ID"
import json, sys
task_id = sys.argv[1]
registry = os.path.expanduser('~/.clawdbot/active-tasks.json')

with open(registry, 'r') as f:
    tasks = json.load(f)

for task in tasks:
    if task['id'] == task_id:
        task['tmux_session'] = task_id
        break

with open(registry, 'w') as f:
    json.dump(tasks, f, indent=2)
PY

echo ""
echo "✅ Agent spawned successfully"
echo ""
echo "Monitor: tmux attach -t $TASK_ID"
echo "Logs: tmux capture-pane -pt $TASK_ID"
echo "Status: bash ~/mission-control/tools/agent-monitor.sh"
