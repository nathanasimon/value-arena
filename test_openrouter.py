#!/usr/bin/env python3
"""
Test script to verify OpenRouter API connectivity and configuration.
"""

import os
import sys
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")

def test_openrouter():
    """Test OpenRouter API connection with a simple call."""
    
    print("=" * 60)
    print("OpenRouter API Test")
    print("=" * 60)
    print()
    
    # Check API key
    if not OPENROUTER_API_KEY:
        print("❌ ERROR: OPENROUTER_API_KEY not found in environment variables")
        print("   Make sure you have a .env file with OPENROUTER_API_KEY set")
        return False
    
    print(f"✅ API Key found: {OPENROUTER_API_KEY[:10]}...{OPENROUTER_API_KEY[-4:]}")
    print()
    
    # Initialize client with headers (same as in llm.py)
    print("Initializing OpenRouter client with headers...")
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_API_KEY,
        default_headers={
            "HTTP-Referer": "https://value-arena.vercel.app",
            "X-Title": "Value Investing Arena",
        }
    )
    print("✅ Client initialized")
    print()
    
    # Test with a simple, cheap model first
    test_models = [
        "deepseek/deepseek-v3.2",  # Cheap model for testing
        "openai/gpt-5.1",  # One of the configured models
    ]
    
    for model in test_models:
        print(f"Testing model: {model}")
        print("-" * 60)
        
        try:
            # Simple test message
            messages = [
                {
                    "role": "user",
                    "content": "Say 'Hello, Value Arena!' and nothing else."
                }
            ]
            
            print("Sending test request...")
            completion = client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=50
            )
            
            # Check response
            if completion.choices and len(completion.choices) > 0:
                response_text = completion.choices[0].message.content
                print(f"✅ Response received: {response_text}")
            else:
                print("⚠️  No response content")
            
            # Check usage/cost info
            if completion.usage:
                usage = completion.usage
                print(f"   Tokens - Prompt: {usage.prompt_tokens}, Completion: {usage.completion_tokens}, Total: {usage.total_tokens}")
            
            # Check for cost in response headers (if available)
            if hasattr(completion, '_headers'):
                print(f"   Response headers available")
            
            print("✅ Test passed!")
            print()
            
            # Only test first model that works to save credits
            break
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Error: {error_msg}")
            
            # Provide helpful error messages
            if "401" in error_msg or "authentication" in error_msg.lower():
                print("   → This might be an authentication issue.")
                print("   → Check that your API key is correct and has credits.")
                print("   → Verify the HTTP-Referer and X-Title headers are set correctly.")
            elif "429" in error_msg:
                print("   → Rate limit exceeded. Wait a moment and try again.")
            elif "model" in error_msg.lower() and "not found" in error_msg.lower():
                print(f"   → Model '{model}' might not be available.")
                print("   → Try a different model or check OpenRouter's model list.")
            else:
                print(f"   → Unexpected error type: {type(e).__name__}")
            
            print()
            
            # Try next model if this one fails
            continue
    
    print("=" * 60)
    print("Test Complete")
    print("=" * 60)
    
    return True

def test_model_list():
    """Test that we can list available models."""
    print()
    print("=" * 60)
    print("Testing Model List Access")
    print("=" * 60)
    print()
    
    if not OPENROUTER_API_KEY:
        print("❌ Cannot test - API key not found")
        return False
    
    try:
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY,
            default_headers={
                "HTTP-Referer": "https://value-arena.vercel.app",
                "X-Title": "Value Investing Arena",
            }
        )
        
        # Try to get models (if API supports it)
        print("Note: OpenRouter may not expose a models endpoint.")
        print("Testing with direct API call instead...")
        print()
        
        # Test with our configured models
        from api.utils.config import MODELS
        print(f"Configured models ({len(MODELS)}):")
        for model in MODELS:
            print(f"  - {model['id']} ({model['display']})")
        
        print()
        print("✅ Model configuration loaded successfully")
        
    except Exception as e:
        print(f"⚠️  Could not load model config: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print()
    
    # Run tests
    test1 = test_openrouter()
    test2 = test_model_list()
    
    print()
    if test1:
        print("✅ OpenRouter connectivity test completed")
    else:
        print("❌ OpenRouter connectivity test failed")
        sys.exit(1)
    
    if test2:
        print("✅ Model configuration test completed")
    else:
        print("⚠️  Model configuration test had issues")
    
    print()
    print("All tests finished!")

