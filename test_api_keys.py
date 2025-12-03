#!/usr/bin/env python3
"""
Test script to verify all API keys are working correctly.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
ALPACA_API_KEY = os.environ.get("ALPACA_API_KEY")
ALPACA_SECRET_KEY = os.environ.get("ALPACA_SECRET_KEY")

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
        print(f"❌ OpenRouter API test failed: {e}")
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
        print(f"❌ Alpaca API test failed: {e}")
        return False

if __name__ == "__main__":
    print()
    print("API Key Test Suite")
    print("=" * 60)
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

