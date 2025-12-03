#!/bin/bash
# Script to sync .env file values to GitHub Environment Secrets using GitHub CLI

set -e

ENV_FILE=".env"
ENVIRONMENT="env"
REPO="nathanasimon/value-arena"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Syncing .env to GitHub Environment Secrets${NC}"
echo "=============================================="
echo ""

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) not found.${NC}"
    echo ""
    echo "Install it with: brew install gh"
    echo "Then authenticate: gh auth login"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub CLI${NC}"
    echo "Run: gh auth login"
    exit 1
fi

# Keys we want to sync
KEYS=("OPENROUTER_API_KEY" "ALPACA_API_KEY" "ALPACA_SECRET_KEY")

echo "Reading secrets from .env file..."
echo ""

for KEY in "${KEYS[@]}"; do
    # Extract value from .env (handles KEY=value format, even with quotes)
    VALUE=$(grep "^${KEY}=" "$ENV_FILE" | cut -d '=' -f2- | sed 's/^"//;s/"$//' | xargs)
    
    if [ -z "$VALUE" ]; then
        echo -e "${YELLOW}⚠️  ${KEY} not found in .env${NC}"
        continue
    fi
    
    echo -e "${BLUE}🔄 Setting ${KEY}...${NC}"
    
    # Use GitHub CLI to set the secret
    echo "$VALUE" | gh secret set "${KEY}" --env "${ENVIRONMENT}" --repo "${REPO}" 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ${KEY} set successfully${NC}"
        echo "   Preview: ${VALUE:0:15}...${VALUE: -4}"
    else
        echo -e "${RED}❌ Failed to set ${KEY}${NC}"
    fi
    echo ""
done

echo -e "${GREEN}✅ Sync complete!${NC}"
echo ""
echo "Run the 'Test API Keys' workflow to verify:"
echo "  https://github.com/${REPO}/actions/workflows/test_api_keys.yml"
