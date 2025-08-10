#!/bin/bash
# Script to set up the development environment

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Avery Portfolio Setup Script      ${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo -e "Please install Node.js from https://nodejs.org/ and run this script again."
    exit 1
fi

echo -e "${GREEN}Node.js detected:${NC} $(node -v)"

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install

# Initialize content directories
echo -e "\n${YELLOW}Initializing content directories...${NC}"
node content-sync.js init

# Check if git is available
if command -v git &> /dev/null; then
    echo -e "\n${YELLOW}Checking git configuration...${NC}"
    
    # Get current git user details
    GIT_NAME=$(git config --get user.name)
    GIT_EMAIL=$(git config --get user.email)
    
    echo "Current git user: ${GIT_NAME} <${GIT_EMAIL}>"
    
    # Prompt to set up git config if needed
    if [ -z "$GIT_NAME" ] || [ -z "$GIT_EMAIL" ]; then
        echo -e "${RED}Git user not fully configured.${NC}"
        echo -e "Please set up your git user configuration before pushing content changes:"
        echo -e "  git config user.name \"Your Name\""
        echo -e "  git config user.email \"your.email@example.com\""
    fi
else
    echo -e "${YELLOW}Git not found. You will need git to push content changes.${NC}"
fi

echo -e "\n${GREEN}Setup complete!${NC}"
echo -e "You can now start the development server with:"
echo -e "${BLUE}  ./start.sh${NC}"
echo -e "Access the site at: http://localhost:8080"
echo -e "Access the CMS at: http://localhost:8080/admin/"
echo -e "${YELLOW}Happy editing!${NC}"
