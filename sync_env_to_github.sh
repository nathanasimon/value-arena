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

# Base keys we want to sync
BASE_KEYS=("OPENROUTER_API_KEY" "ALPACA_API_KEY" "ALPACA_SECRET_KEY")

echo "Reading secrets from .env file..."
echo ""

# Sync base keys
for KEY in "${BASE_KEYS[@]}"; do
    # Extract value from .env (handles KEY=value format, even with quotes)
    # Use 'tail -1' to get the LAST occurrence (matches python-dotenv behavior)
    VALUE=$(grep "^${KEY}=" "$ENV_FILE" | tail -1 | cut -d '=' -f2- | sed 's/^"//;s/"$//' | xargs)
    
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

# Sync model-specific Alpaca keys (ALPACA_API_KEY_* and ALPACA_SECRET_KEY_*)
echo -e "${BLUE}Syncing model-specific Alpaca keys...${NC}"
echo ""

MODEL_KEYS=$(grep -E "^ALPACA_(API_KEY|SECRET_KEY)_" "$ENV_FILE" | cut -d '=' -f1 | sort -u)

if [ -z "$MODEL_KEYS" ]; then
    echo -e "${YELLOW}⚠️  No model-specific Alpaca keys found${NC}"
    echo "   (This is okay if you're using a single account for all models)"
else
    for KEY in $MODEL_KEYS; do
        # Extract value from .env (handles KEY=value format, even with quotes)
        VALUE=$(grep "^${KEY}=" "$ENV_FILE" | tail -1 | cut -d '=' -f2- | sed 's/^"//;s/"$//' | xargs)
        
        if [ -z "$VALUE" ]; then
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
fi

echo -e "${GREEN}✅ Sync complete!${NC}"
echo ""
echo "Run the 'Test API Keys' workflow to verify:"
echo "  https://github.com/${REPO}/actions/workflows/test_api_keys.yml"
