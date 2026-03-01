#!/usr/bin/env bash
set -euo pipefail

# Ralph Loop v2 - Learn from success/failure and adjust prompts
# Usage: bash tools/orchestrator/ralph-loop.sh <task_id> <outcome>

TASK_ID="$1"
OUTCOME="${2:-unknown}"  # success | failure | retry

PATTERNS_DB=~/.clawdbot/prompt-patterns.json
TASK_REGISTRY=~/.clawdbot/active-tasks.json

echo "🔄 Ralph Loop v2 — Learning from $OUTCOME"
echo ""

# Initialize patterns DB if needed
if [ ! -f "$PATTERNS_DB" ]; then
  echo '{"patterns": [], "stats": {"total_runs": 0, "successes": 0, "failures": 0}}' > "$PATTERNS_DB"
fi

python3 - <<'PY' "$TASK_ID" "$OUTCOME" "$PATTERNS_DB" "$TASK_REGISTRY"
import json, sys, os
from datetime import datetime

task_id = sys.argv[1]
outcome = sys.argv[2]
patterns_file = sys.argv[3]
registry_file = sys.argv[4]

# Load patterns DB
with open(patterns_file, 'r') as f:
    db = json.load(f)

# Load task registry
with open(registry_file, 'r') as f:
    tasks = json.load(f)

# Find task
task = None
for t in tasks:
    if t['id'] == task_id:
        task = t
        break

if not task:
    print(f"❌ Task {task_id} not found in registry")
    sys.exit(1)

task_desc = task.get('task', '')
task_type = task.get('task_type', 'unknown')
agent_used = task.get('agent_used', 'codex')

print(f"→ Task: {task_desc[:60]}...")
print(f"  Type: {task_type}")
print(f"  Agent: {agent_used}")
print(f"  Outcome: {outcome}")
print("")

# Update stats
db['stats']['total_runs'] += 1
if outcome == 'success':
    db['stats']['successes'] += 1
elif outcome == 'failure':
    db['stats']['failures'] += 1

# Log pattern
pattern = {
    'task_id': task_id,
    'task_type': task_type,
    'agent': agent_used,
    'outcome': outcome,
    'timestamp': datetime.utcnow().isoformat() + 'Z',
    'prompt_length': len(task.get('prompt', '')),
    'context_count': task.get('context_count', 0),
    'respawn_attempts': task.get('respawn_attempts', 0)
}

# Add failure context if failed
if outcome == 'failure':
    pattern['failure_reason'] = task.get('failure_reason', 'unknown')

db['patterns'].append(pattern)

# Keep only last 1000 patterns
if len(db['patterns']) > 1000:
    db['patterns'] = db['patterns'][-1000:]

# Analyze patterns for this task type
similar_patterns = [p for p in db['patterns'] 
                     if p['task_type'] == task_type and p['agent'] == agent_used]

if len(similar_patterns) >= 5:
    successes = [p for p in similar_patterns if p['outcome'] == 'success']
    failures = [p for p in similar_patterns if p['outcome'] == 'failure']
    
    success_rate = len(successes) / len(similar_patterns) * 100
    
    print(f"→ Historical performance for {task_type} with {agent_used}:")
    print(f"  Success rate: {success_rate:.1f}%")
    print(f"  Total runs: {len(similar_patterns)}")
    
    if successes:
        avg_prompt_len = sum(p['prompt_length'] for p in successes) / len(successes)
        avg_context = sum(p['context_count'] for p in successes) / len(successes)
        print(f"  Successful avg prompt: {int(avg_prompt_len)} chars")
        print(f"  Successful avg context: {int(avg_context)} snippets")
    
    # Generate recommendation for retry
    if outcome == 'failure' and successes:
        print("")
        print("💡 Retry recommendations:")
        
        if pattern['prompt_length'] < avg_prompt_len:
            print("  - Increase prompt detail (current is shorter than avg success)")
        
        if pattern['context_count'] < avg_context:
            print("  - Add more business context (current has fewer snippets)")
        
        # Check if more respawns correlate with failure
        high_respawn_failures = [p for p in failures if p.get('respawn_attempts', 0) > 1]
        if len(high_respawn_failures) / max(len(failures), 1) > 0.5:
            print("  - Consider changing agent or breaking task into smaller pieces")

# Save updated DB
with open(patterns_file, 'w') as f:
    json.dump(db, f, indent=2)

print("")
print(f"✅ Pattern logged. DB now has {len(db['patterns'])} patterns.")
print(f"   Overall success rate: {db['stats']['successes'] / max(db['stats']['total_runs'], 1) * 100:.1f}%")
PY
