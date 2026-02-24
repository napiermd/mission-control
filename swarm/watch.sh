#!/usr/bin/env bash
set -euo pipefail

RUN_DIR="${1:-}"
if [[ -z "$RUN_DIR" || ! -d "$RUN_DIR" ]]; then
  echo "Usage: bash swarm/watch.sh <run_dir>"
  exit 1
fi

echo "Watching run: $RUN_DIR"
echo "Ctrl+C to stop."

while true; do
  clear
  echo "=== SWARM STATUS ==="
  for role in planner implementer tester; do
    pid_file="$RUN_DIR/$role.pid"
    log_file="$RUN_DIR/$role.log"

    status="unknown"
    if [[ -f "$pid_file" ]]; then
      pid="$(cat "$pid_file")"
      if kill -0 "$pid" 2>/dev/null; then
        status="running"
      else
        status="done"
      fi
    fi

    echo "[$role] $status"
    if [[ -f "$log_file" ]]; then
      tail -n 8 "$log_file" | sed "s/^/  /"
    fi
    echo
  done
  sleep 4
done
