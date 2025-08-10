#!/bin/bash
# Improved start script for Avery Portfolio site

# Default port
PORT=8080

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check for optional arguments
while getopts ":p:a" opt; do
  case ${opt} in
    p )
      PORT=$OPTARG
      ;;
    a )
      OPEN_ADMIN=1
      ;;
    \? )
      echo "Usage: ./start.sh [-p PORT] [-a]"
      echo "  -p PORT  Specify a port (default: 8080)"
      echo "  -a       Open the admin interface instead of the main site"
      exit 1
      ;;
  esac
done

echo -e "${GREEN}Starting Avery Smith Portfolio development server...${NC}"

# Check for existing process on port
if command -v lsof &>/dev/null; then
  EXISTING_PID=$(lsof -ti:$PORT)
  if [ ! -z "$EXISTING_PID" ]; then
    echo -e "${YELLOW}Warning: Port $PORT is already in use by process $EXISTING_PID${NC}"
    echo -ne "Do you want to stop this process? [y/N] "
    read STOP_PROCESS
    if [[ "$STOP_PROCESS" =~ ^[Yy]$ ]]; then
      echo "Stopping process..."
      kill $EXISTING_PID
      sleep 1
    else
      echo "Exiting..."
      exit 1
    fi
  fi
fi

# Set environment variables
export PORT=$PORT

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
fi

# Initialize content directories if needed
echo -e "${BLUE}Initializing content directories...${NC}"
node content-sync.js init

# Start the main server
echo -e "${BLUE}Starting main server on port $PORT...${NC}"
node server.js &
SERVER_PID=$!

# Start the local CMS backend (on port 8082)
echo -e "${BLUE}Starting local CMS backend...${NC}"
node local-backend.js &
CMS_PID=$!

# Wait for servers to start and check their status
echo "Waiting for servers to initialize..."

# Function to check if a server is responding
check_server() {
  local url=$1
  local max_attempts=$2
  local attempt=1
  local server_name=$3
  
  echo -ne "Checking $server_name at $url... "
  
  while [ $attempt -le $max_attempts ]; do
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|404"; then
      echo -e "${GREEN}OK${NC}"
      return 0
    fi
    
    echo -ne "."
    sleep 1
    ((attempt++))
  done
  
  echo -e "\n${YELLOW}Warning: $server_name at $url did not respond after $max_attempts attempts${NC}"
  return 1
}

# Check both servers
main_server_ok=0
cms_backend_ok=0

# Try to connect to main server
if check_server "http://localhost:$PORT" 5 "Main server"; then
  main_server_ok=1
fi

# Try to connect to CMS backend
if check_server "http://localhost:8082/api/v1" 5 "CMS backend"; then
  cms_backend_ok=1
fi

# If any server failed to start, warn the user
if [ $main_server_ok -eq 0 ] || [ $cms_backend_ok -eq 0 ]; then
  echo -e "${YELLOW}Warning: One or more servers failed to start properly${NC}"
  echo -e "Main server: $([ $main_server_ok -eq 1 ] && echo "${GREEN}OK${NC}" || echo "${YELLOW}Not responding${NC}")"
  echo -e "CMS backend: $([ $cms_backend_ok -eq 1 ] && echo "${GREEN}OK${NC}" || echo "${YELLOW}Not responding${NC}")"
  
  if [ $cms_backend_ok -eq 0 ]; then
    echo -e "${YELLOW}The CMS admin interface may not work correctly without the backend server${NC}"
    echo -e "Try running the backend server manually with: node local-backend.js"
  fi
  
  echo -ne "Do you want to continue anyway? [y/N] "
  read CONTINUE
  if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
    echo "Stopping servers..."
    kill $SERVER_PID 2>/dev/null
    kill $CMS_PID 2>/dev/null
    exit 1
  fi
fi

# Build the URL
SITE_URL="http://localhost:$PORT"
ADMIN_URL="$SITE_URL/admin"

if [ "$OPEN_ADMIN" = "1" ]; then
  OPEN_URL=$ADMIN_URL
  echo -e "${GREEN}Opening admin interface at $OPEN_URL${NC}"
else
  OPEN_URL=$SITE_URL
  echo -e "${GREEN}Opening main site at $OPEN_URL${NC}"
fi

# Open browser (platform-specific)
case "$(uname -s)" in
  Darwin*)  open "$OPEN_URL" ;; # macOS
  Linux*)   
    if command -v xdg-open &>/dev/null; then
      xdg-open "$OPEN_URL" 
    else 
      echo "Please open $OPEN_URL in your browser"
    fi
    ;;
  CYGWIN*|MINGW*|MSYS*)  start "$OPEN_URL" ;; # Windows
  *)        echo "Please open $OPEN_URL in your browser" ;;
esac

# Display helpful information
echo ""
echo -e "${BLUE}Server is running:${NC}"
echo -e "  Main site: ${GREEN}$SITE_URL${NC}"
echo -e "  Admin interface: ${GREEN}$ADMIN_URL${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"

# Handle graceful shutdown
trap "echo -e '\n${GREEN}Stopping servers...${NC}'; kill $SERVER_PID; kill $CMS_PID; echo -e '${GREEN}All servers stopped${NC}'; exit 0" INT TERM

# Wait for both processes
wait $SERVER_PID $CMS_PID
