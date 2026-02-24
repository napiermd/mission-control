# Agent Swarm (PoC)

This is a reusable swarm scaffold you can run against this repo now, then reuse for other repos.

## What it does

For a given task, it launches 3 parallel agents in isolated git worktrees:

1. **planner** → writes an execution plan (`SWARM_PLAN.md`)
2. **implementer** → makes code changes on its own branch
3. **tester** → runs tests/lint and writes findings (`SWARM_QA.md`)

Each agent runs as a background Codex process with separate logs.

## Usage

```bash
cd /Users/andrewbot/mission-control
bash swarm/run.sh --task "Improve mobile dashboard and add source-health badges"
```

Optional:

```bash
bash swarm/run.sh --task "..." --base main
```

Watch a run:

```bash
bash swarm/watch.sh ~/.openclaw/swarm-runs/mission-control/<RUN_ID>
```

## Output

Run artifacts are stored in:

`~/.openclaw/swarm-runs/mission-control/<RUN_ID>/`

- `meta.env` (paths/branches)
- `planner.log`
- `implementer.log`
- `tester.log`

## Safety defaults

- isolated worktrees per role
- no direct edits on your main working tree
- explicit branches: `swarm/<RUN_ID>/<role>`

## Promote changes

After review, merge the implementer branch manually:

```bash
git checkout <base-branch>
git merge --no-ff swarm/<RUN_ID>/implementer
```

Then run your final validation before pushing.
