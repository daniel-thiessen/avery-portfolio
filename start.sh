#!/bin/bash
echo "Starting local development server..."
echo "Opening browser at http://localhost:8080"

# Start the server
node server.js &
SERVER_PID=$!

# Wait a moment for the server to start
sleep 1

# Open the browser (works on macOS)
open "http://localhost:8080"

# Keep the script running, show message on how to stop
echo "Server running. Press Ctrl+C to stop."

# Wait for user to press Ctrl+C
trap "kill $SERVER_PID; echo 'Server stopped'; exit 0" INT
wait
