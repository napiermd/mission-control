# Mission Control Orchestrator

**Elvis-style two-tier agent orchestration system**

---

## Architecture

```
┌─────────────────────────────────────────┐
│         ORCHESTRATOR (This Layer)       │
│  - Holds business context (Obsidian)    │
│  - Analyzes task type                   │
│  - Selects right agent                  │
│  - Builds precise prompts                │
│  - Monitors + auto-recovers             │
└─────────────────────────────────────────┘
                  │
                  ↓ (spawns with context)
┌─────────────────────────────────────────┐
│        CODING AGENTS (Workers)          │
│  - Isolated git worktrees               │
│  - Focus only on code                   │
│  - Create PRs when done                 │
│  - No business context pollution        │
└─────────────────────────────────────────┘
```

---

## Usage

### Spawn Agent with Business Context

```bash
cd ~/mission-control
bash tools/orchestrator/spawn.sh "Add dark mode toggle to dashboard"
```

What happens:
1. **Orchestrator analyzes task** → determines it's frontend UI work
2. **Loads business context** → searches Obsidian for related notes
3. **Selects agent** → picks Claude (best for frontend)
4. **Builds prompt** → injects customer context + requirements
5. **Spawns in isolation** → creates worktree at `/tmp/mission-control-agent-*`
6. **Monitors progress** → auto-respawns on failure (max 3x)

### Manual Spawn (Without Orchestrator)

```bash
cd ~/mission-control
bash tools/spawn-agent-safe.sh "your task"
```

This skips business context injection. Use when you want direct control.

---

## Agent Selection Rules

Defined in `config.yaml`:

- **Backend/API** → Codex (gpt-5.2-codex)
- **Frontend/UI** → Claude (claude-sonnet-3.5)
- **Design spec** → Gemini (gemini-2.0-flash-exp)
- **Bug fix** → Codex (thorough, catches edge cases)
- **Refactor** → Codex (best at multi-file refactors)

---

## Ralph Loop v2 (Pattern Learning)

Every task outcome is logged. System learns what works.

### Log Success/Failure

```bash
bash tools/orchestrator/ralph-loop.sh <task_id> success
bash tools/orchestrator/ralph-loop.sh <task_id> failure
```

### What It Learns

- **Success patterns:**
  - Which agent works best for each task type
  - Optimal prompt length
  - How much context helps

- **Failure signals:**
  - CI failures
  - Respawn attempts
  - Human intervention needed

### Retry Recommendations

When a task fails, Ralph Loop analyzes historical patterns and suggests:
- "Increase prompt detail (current shorter than avg success)"
- "Add more business context"
- "Consider different agent or break into smaller tasks"

---

## Proactive Work Finding

Scans for work automatically (3x/day: 8am, 2pm, 6pm PT).

### What It Scans

1. **Meeting notes** → feature requests, action items
2. **GitHub issues** → open bugs labeled "bug"
3. **Sentry** → production errors (placeholder, requires API setup)

### Run Manually

```bash
bash tools/orchestrator/proactive-scan.sh
```

Output saved to:
- `/tmp/proactive-feature-requests.json`
- `/tmp/proactive-github-issues.json`

### Auto-Spawn (Optional)

To automatically spawn agents for found tasks, edit `config.yaml`:

```yaml
auto_spawn:
  enabled: true
  max_concurrent: 3
  task_types:
    - bug_fix
    - feature_request
```

**Use with caution!** Start with manual review first.

---

## Files

```
tools/orchestrator/
├── README.md              # This file
├── config.yaml            # Agent routing + prompt templates
├── spawn.sh               # Main orchestrator entry point
├── ralph-loop.sh          # Pattern learning
└── proactive-scan.sh      # Auto work finder
```

---

## Key Insight (Elvis)

> "Context windows are zero-sum. Fill it with code → no room for business context. Fill it with customer history → no room for the codebase."

**Solution:**  
Orchestrator holds business context. Agents see only code.

---

## Example Workflow

**User says:** "Customer wants to save dashboard configurations"

**Old way:**
```bash
codex exec "Add feature to save dashboard configs"
```
Agent has no context about customer, product, existing architecture.

**New way (Orchestrator):**
```bash
bash tools/orchestrator/spawn.sh "Customer wants to save dashboard configurations"
```

Orchestrator:
1. Searches Obsidian → finds meeting notes about this customer
2. Finds related feature discussions
3. Builds prompt:
   ```
   Customer Request Context:
   - Companies/IntuBlade/Meeting-2026-02-25: Customer asked to reuse configs
   - 10 Projects/Dashboard: Existing configuration system uses local storage
   
   Feature Requirements:
   Customer wants to save dashboard configurations
   
   Task: Add save/load configuration feature
   
   Definition of Done:
   - Users can save current config
   - Users can load saved configs
   - Tests added
   - PR created with screenshots
   ```
4. Spawns Codex in isolated worktree
5. Monitors progress, auto-respawns on failure

---

## Monitoring

### Check Active Agents

```bash
bash ~/mission-control/tools/agent-monitor.sh
```

### View Task Registry

```bash
cat ~/.clawdbot/active-tasks.json | jq
```

### View Pattern Learning DB

```bash
cat ~/.clawdbot/prompt-patterns.json | jq '.stats'
```

---

## Integration with Existing Tools

**P0 + P1 fixes still active:**
- CI gate blocks broken code
- PR readiness checks
- Emergency rollback available
- Worktree isolation prevents race conditions
- Monitoring cron watches health every 10 min

**Orchestrator adds:**
- Business context injection
- Smart agent selection
- Pattern learning from outcomes
- Proactive work discovery

---

## Next Steps

1. **Test orchestrator spawn:**
   ```bash
   bash tools/orchestrator/spawn.sh "Add loading spinner to dashboard"
   ```

2. **Monitor the agent:**
   ```bash
   tmux attach -t agent-TIMESTAMP
   ```

3. **When task completes, log outcome:**
   ```bash
   bash tools/orchestrator/ralph-loop.sh agent-TIMESTAMP success
   ```

4. **View learned patterns:**
   ```bash
   cat ~/.clawdbot/prompt-patterns.json | jq '.patterns[-5:]'
   ```

---

**Status:** P2 Orchestrator fully functional. Elvis-style two-tier architecture implemented.
