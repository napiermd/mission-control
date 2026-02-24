#!/usr/bin/env bash
set -euo pipefail

TASK=""
BASE_BRANCH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --task) TASK="$2"; shift 2 ;;
    --base) BASE_BRANCH="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [[ -z "$TASK" ]]; then
  echo "Usage: bash swarm/run.sh --task \"...\" [--base main]"
  exit 1
fi

AGENT_BIN="${SWARM_AGENT_BIN:-}"
if [[ -z "$AGENT_BIN" ]]; then
  if command -v codex >/dev/null 2>&1; then
    AGENT_BIN="codex"
  elif command -v claude >/dev/null 2>&1; then
    AGENT_BIN="claude"
  else
    echo "No supported agent CLI found (codex or claude)."
    exit 1
  fi
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_NAME="$(basename "$REPO_ROOT")"
cd "$REPO_ROOT"

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
BASE_BRANCH="${BASE_BRANCH:-$CURRENT_BRANCH}"
RUN_ID="$(date +%Y%m%d-%H%M%S)"
RUN_DIR="$HOME/.openclaw/swarm-runs/$REPO_NAME/$RUN_ID"
mkdir -p "$RUN_DIR"

for role in planner implementer tester; do
  WT="$RUN_DIR/$role"
  BR="swarm/$RUN_ID/$role"

  git worktree add -B "$BR" "$WT" "$BASE_BRANCH" >/dev/null

done

cat > "$RUN_DIR/meta.env" <<EOF
RUN_ID=$RUN_ID
REPO_ROOT=$REPO_ROOT
REPO_NAME=$REPO_NAME
BASE_BRANCH=$BASE_BRANCH
RUN_DIR=$RUN_DIR
EOF

cat > "$RUN_DIR/planner.prompt.txt" <<EOF
You are the planner agent for repo $REPO_NAME.
Task: $TASK
Produce a concise implementation plan in SWARM_PLAN.md with:
- scope
- files likely to change
- risk checks
- validation checklist
EOF

cat > "$RUN_DIR/implementer.prompt.txt" <<EOF
You are the implementer agent for repo $REPO_NAME.
Task: $TASK
Implement directly in code. Keep changes focused.
After edits, run tests/build if available.
Summarize what changed in SWARM_IMPL.md.
EOF

cat > "$RUN_DIR/tester.prompt.txt" <<EOF
You are the tester/reviewer agent for repo $REPO_NAME.
Task: $TASK
Run validation (npm test / npm run build / lint if available).
Write findings, regressions, and pass/fail in SWARM_QA.md.
EOF

if [[ "$AGENT_BIN" == "codex" ]]; then
  planner_cmd="$AGENT_BIN exec \"\$(cat '$RUN_DIR/planner.prompt.txt')\""
  implementer_cmd="$AGENT_BIN exec --full-auto \"\$(cat '$RUN_DIR/implementer.prompt.txt')\""
  tester_cmd="$AGENT_BIN exec \"\$(cat '$RUN_DIR/tester.prompt.txt')\""
else
  planner_cmd="$AGENT_BIN \"\$(cat '$RUN_DIR/planner.prompt.txt')\""
  implementer_cmd="$AGENT_BIN \"\$(cat '$RUN_DIR/implementer.prompt.txt')\""
  tester_cmd="$AGENT_BIN \"\$(cat '$RUN_DIR/tester.prompt.txt')\""
fi

nohup bash -lc "cd '$RUN_DIR/planner' && $planner_cmd" > "$RUN_DIR/planner.log" 2>&1 < /dev/null &
echo $! > "$RUN_DIR/planner.pid"

nohup bash -lc "cd '$RUN_DIR/implementer' && $implementer_cmd" > "$RUN_DIR/implementer.log" 2>&1 < /dev/null &
echo $! > "$RUN_DIR/implementer.pid"

nohup bash -lc "cd '$RUN_DIR/tester' && $tester_cmd" > "$RUN_DIR/tester.log" 2>&1 < /dev/null &
echo $! > "$RUN_DIR/tester.pid"

echo "Swarm started: $RUN_ID"
echo "Agent: $AGENT_BIN"
echo "Run dir: $RUN_DIR"
echo "Watch: bash swarm/watch.sh $RUN_DIR"
