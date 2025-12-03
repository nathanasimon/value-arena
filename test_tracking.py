#!/usr/bin/env python3
"""
Test script to verify portfolio tracking system works correctly.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_tracking():
    """Test the portfolio tracking system."""
    print("=" * 60)
    print("Testing Portfolio Tracking System")
    print("=" * 60)
    
    # Test imports
    try:
        from api.utils.portfolio import load_portfolio, save_portfolio, log_trade, update_nav, calculate_nav_from_positions
        from api.utils.alpaca import execute_trade, get_alpaca_portfolio
        from api.utils.research import get_price
        print("✅ All imports successful")
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False
    
    # Test 1: Load/create portfolio
    print("\n1. Testing portfolio creation...")
    test_model_id = "test-model"
    portfolio = load_portfolio(test_model_id)
    print(f"   ✅ Portfolio loaded: {portfolio['model_id']}")
    print(f"   Starting capital: ${portfolio['starting_capital']}")
    
    # Test 2: Test Alpaca connection
    print("\n2. Testing Alpaca connection...")
    try:
        alpaca_portfolio = get_alpaca_portfolio()
        if "error" in alpaca_portfolio:
            print(f"   ❌ Alpaca error: {alpaca_portfolio['error']}")
            return False
        print(f"   ✅ Alpaca connected")
        print(f"   Account equity: ${alpaca_portfolio.get('portfolio_value', 0):,.2f}")
        print(f"   Cash: ${alpaca_portfolio.get('cash', 0):,.2f}")
    except Exception as e:
        print(f"   ❌ Alpaca connection failed: {e}")
        return False
    
    # Test 3: Test price lookup
    print("\n3. Testing price lookup...")
    try:
        price_data = get_price("AAPL")
        if "error" in price_data:
            print(f"   ❌ Price lookup error: {price_data['error']}")
            return False
        print(f"   ✅ AAPL price: ${price_data.get('price', 0):.2f}")
    except Exception as e:
        print(f"   ❌ Price lookup failed: {e}")
        return False
    
    # Test 4: Test position tracking (simulated trade)
    print("\n4. Testing position tracking...")
    try:
        # Simulate a BUY trade
        test_trade = {
            "ticker": "AAPL",
            "action": "BUY",
            "amount_usd": 1000,
            "thesis": "Test trade for tracking verification"
        }
        
        # Get current price
        price_data = get_price("AAPL")
        current_price = price_data.get("price", 150)
        
        # Simulate trade result
        trade_result = {
            "filled_qty": 1000 / current_price,
            "filled_avg_price": current_price,
            "status": "filled",
            "price": current_price
        }
        
        print(f"   Trade result: {trade_result}")
        print(f"   Current price: {current_price}")
        
        # Log trade (this will update positions)
        log_trade(test_model_id, test_trade, trade_result)
        
        # Reload portfolio to check
        portfolio = load_portfolio(test_model_id)
        positions = portfolio.get("positions", [])
        
        if len(positions) > 0:
            pos = positions[0]
            print(f"   ✅ Position tracked: {pos['ticker']}")
            print(f"   Shares: {pos['shares']:.4f}")
            print(f"   Entry price: ${pos['entry_price']:.2f}")
            print(f"   Market value: ${pos['market_value']:.2f}")
        else:
            print("   ⚠️  No positions found after trade")
    except Exception as e:
        print(f"   ❌ Position tracking failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Test 5: Test NAV calculation
    print("\n5. Testing NAV calculation...")
    try:
        nav = calculate_nav_from_positions(test_model_id)
        portfolio = load_portfolio(test_model_id)
        print(f"   ✅ NAV calculated: ${nav:,.2f}")
        print(f"   Starting capital: ${portfolio['starting_capital']:,.2f}")
        print(f"   Positions: {len(portfolio.get('positions', []))}")
        print(f"   Trade history: {len(portfolio.get('trade_history', []))}")
    except Exception as e:
        print(f"   ❌ NAV calculation failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("\n" + "=" * 60)
    print("✅ All tracking tests passed!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = test_tracking()
    sys.exit(0 if success else 1)

