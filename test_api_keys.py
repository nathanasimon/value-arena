#!/usr/bin/env python3
"""
Test script to verify all API keys are working correctly.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get and strip whitespace from environment variables
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "").strip()
ALPACA_API_KEY = os.environ.get("ALPACA_API_KEY", "").strip()
ALPACA_SECRET_KEY = os.environ.get("ALPACA_SECRET_KEY", "").strip()

# Debug: Check if we're in GitHub Actions
IS_GITHUB_ACTIONS = os.environ.get("GITHUB_ACTIONS") == "true"

def test_openrouter():
    """Test OpenRouter API key."""
    print("=" * 60)
    print("Testing OpenRouter API Key")
    print("=" * 60)
    
    if not OPENROUTER_API_KEY:
        print("❌ OPENROUTER_API_KEY is not set")
        return False
    
    print(f"✅ API Key found: {OPENROUTER_API_KEY[:10]}...{OPENROUTER_API_KEY[-4:]}")
    
    try:
        from openai import OpenAI
        
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY,
            default_headers={
                "HTTP-Referer": "https://value-arena.vercel.app",
                "X-Title": "Value Investing Arena",
            }
        )
        
        # Simple test call with a cheap model
        print("Testing API call with deepseek/deepseek-v3.2...")
        completion = client.chat.completions.create(
            model="deepseek/deepseek-v3.2",
            messages=[{"role": "user", "content": "Say 'test'"}],
            max_tokens=10
        )
        
        if completion.choices and len(completion.choices) > 0:
            print(f"✅ OpenRouter API working! Response: {completion.choices[0].message.content}")
            return True
        else:
            print("❌ No response from OpenRouter")
            return False
            
    except Exception as e:
        error_msg = str(e)
        print(f"❌ OpenRouter API test failed: {error_msg}")
        
        # Provide helpful error messages
        if "401" in error_msg or "User not found" in error_msg:
            print("   → This usually means:")
            print("     1. The API key is invalid or expired")
            print("     2. The API key doesn't have the right permissions")
            print("     3. Check your OpenRouter dashboard: https://openrouter.ai/keys")
        elif "429" in error_msg:
            print("   → Rate limit exceeded. Wait a moment and try again.")
        
        return False

def test_alpaca():
    """Test Alpaca API keys."""
    print()
    print("=" * 60)
    print("Testing Alpaca API Keys")
    print("=" * 60)
    
    if not ALPACA_API_KEY:
        print("❌ ALPACA_API_KEY is not set")
        return False
    
    if not ALPACA_SECRET_KEY:
        print("❌ ALPACA_SECRET_KEY is not set")
        return False
    
    print(f"✅ API Key found: {ALPACA_API_KEY[:10]}...{ALPACA_API_KEY[-4:]}")
    print(f"✅ Secret Key found: {ALPACA_SECRET_KEY[:10]}...{ALPACA_SECRET_KEY[-4:]}")
    
    try:
        from alpaca.trading.client import TradingClient
        
        # Test with paper trading
        client = TradingClient(
            api_key=ALPACA_API_KEY,
            secret_key=ALPACA_SECRET_KEY,
            paper=True
        )
        
        print("Testing Alpaca API connection...")
        account = client.get_account()
        
        if account:
            print(f"✅ Alpaca API working! Account status: {account.status}")
            print(f"   Account equity: ${float(account.equity):,.2f}")
            return True
        else:
            print("❌ No account data returned")
            return False
            
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Alpaca API test failed: {error_msg}")
        
        # Provide helpful error messages
        if "401" in error_msg or "unauthorized" in error_msg.lower():
            print("   → This usually means:")
            print("     1. The API keys are incorrect")
            print("     2. You're using live trading keys instead of paper trading keys")
            print("     3. The account doesn't exist or is disabled")
            print("     4. Check your Alpaca dashboard: https://app.alpaca.markets/paper/dashboard/overview")
            print("     5. Make sure you're copying the FULL keys (no spaces or extra characters)")
        elif "403" in error_msg:
            print("   → Access forbidden. Check account permissions.")
        
        return False

if __name__ == "__main__":
    print()
    print("API Key Test Suite")
    print("=" * 60)
    
    if IS_GITHUB_ACTIONS:
        print("🔧 Running in GitHub Actions")
        print("   Environment: env")
    else:
        print("💻 Running locally")
        print("   Loading from .env file")
    
    print()
    
    # Check which keys are available
    print("Checking environment variables...")
    keys_status = {
        "OPENROUTER_API_KEY": "✅" if OPENROUTER_API_KEY else "❌",
        "ALPACA_API_KEY": "✅" if ALPACA_API_KEY else "❌",
        "ALPACA_SECRET_KEY": "✅" if ALPACA_SECRET_KEY else "❌",
    }
    for key, status in keys_status.items():
        print(f"   {status} {key}")
    print()
    
    results = []
    
    # Test OpenRouter
    results.append(("OpenRouter", test_openrouter()))
    
    # Test Alpaca
    results.append(("Alpaca", test_alpaca()))
    
    # Summary
    print()
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    all_passed = True
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{name}: {status}")
        if not passed:
            all_passed = False
    
    print()
    if all_passed:
        print("✅ All API keys are working correctly!")
        sys.exit(0)
    else:
        print("❌ Some API keys failed. Check the errors above.")
        sys.exit(1)

