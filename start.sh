#!/usr/bin/env bash
# Start XLSForm Debugger v2 — API + Frontend in one command
# Usage: ./start.sh

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
API_PORT=5050
APP_PORT=5173

cleanup() {
  echo ""
  echo "Shutting down..."
  kill "$API_PID" "$APP_PID" 2>/dev/null
  wait "$API_PID" "$APP_PID" 2>/dev/null
  echo "Done."
}
trap cleanup EXIT INT TERM

# Start API
echo "Starting API on port $API_PORT..."
cd "$PROJECT_DIR/api"
uvicorn main:app --port "$API_PORT" &
API_PID=$!

# Start Frontend
echo "Starting frontend on port $APP_PORT..."
cd "$PROJECT_DIR/app"
npm run dev &
APP_PID=$!

echo ""
echo "XLSForm Debugger v2 is running:"
echo "  Frontend: http://localhost:$APP_PORT"
echo "  API:      http://localhost:$API_PORT"
echo ""
echo "Press Ctrl+C to stop both services."

wait
