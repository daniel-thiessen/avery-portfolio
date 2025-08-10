#!/bin/bash
# Script to start just the CMS backend server

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default port
CMS_PORT=8082

# Check for existing process on the CMS port
if command -v lsof &>/dev/null; then
  EXISTING_PID=$(lsof -ti:$CMS_PORT)
  if [ ! -z "$EXISTING_PID" ]; then
    echo -e "${YELLOW}Warning: Port $CMS_PORT is already in use by process $EXISTING_PID${NC}"
    echo -ne "Do you want to stop this process? [y/N] "
    read STOP_PROCESS
    if [[ "$STOP_PROCESS" =~ ^[Yy]$ ]]; then
      echo "Stopping process..."
      kill $EXISTING_PID
      sleep 1
    else
      echo "Using a different port..."
      CMS_PORT=8083
      export PORT=$CMS_PORT
    fi
  fi
fi

echo -e "${GREEN}Starting CMS backend server on port $CMS_PORT...${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
fi

# Initialize content directories if needed
echo -e "${BLUE}Initializing content directories...${NC}"
node content-sync.js init

# Start the CMS backend server
echo -e "${BLUE}Starting CMS backend server...${NC}"
export PORT=$CMS_PORT
node local-backend.js

# Note: This script doesn't return to the prompt until you press Ctrl+C
# The server runs in the foreground so you can see its output
