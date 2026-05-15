#!/usr/bin/env bash
set -euo pipefail

export EMOTION_SERVICE_URL="${EMOTION_SERVICE_URL:-http://127.0.0.1:8001}"
export ATE_SERVICE_URL="${ATE_SERVICE_URL:-http://127.0.0.1:8002}"
export CRISIS_SERVICE_URL="${CRISIS_SERVICE_URL:-http://127.0.0.1:8003}"
export FILTER_SERVICE_URL="${FILTER_SERVICE_URL:-http://127.0.0.1:8004}"
export PORT="${PORT:-3000}"

pids=()

cleanup() {
  echo "Shutting down backend processes..."
  if [ "${#pids[@]}" -gt 0 ]; then
    kill "${pids[@]}" 2>/dev/null || true
    wait "${pids[@]}" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

start_python_service() {
  local name="$1"
  local app_dir="$2"
  local port="$3"

  echo "Starting ${name} service on 127.0.0.1:${port}"
  uvicorn app:app --app-dir "${app_dir}" --host 127.0.0.1 --port "${port}" &
  pids+=("$!")
}

start_python_service "emotion" "/app/services/emotion" "8001"
start_python_service "ate" "/app/services/ate" "8002"
start_python_service "crisis" "/app/services/crisis" "8003"
start_python_service "filter" "/app/services/filter" "8004"

echo "Running database migrations..."
cd /app/services/conversation
node migrate.js

echo "Starting conversation service on 0.0.0.0:${PORT}"
node src/index.js &
pids+=("$!")

wait -n "${pids[@]}"
exit_code="$?"
echo "A backend process exited with code ${exit_code}; stopping container."
exit "${exit_code}"
