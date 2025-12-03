from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce
from .config import ALPACA_API_KEY, ALPACA_SECRET_KEY, ALPACA_PAPER
from .research import get_price

def execute_trade(ticker: str, side: str, amount_usd: float, model_id: str = None) -> dict:
    """
    Execute a trade via Alpaca paper trading.
    Note: All models share the same Alpaca account, but we track positions separately in JSON files.
    
    Args:
        ticker: Stock ticker symbol
        side: "BUY" or "SELL"
        amount_usd: Dollar amount to trade
        model_id: Model ID for tracking purposes (not used for account selection)
    """
    if not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
        print("Alpaca credentials missing.")
        return {"error": "Credentials missing"}

    client = TradingClient(ALPACA_API_KEY, ALPACA_SECRET_KEY, paper=ALPACA_PAPER)
    
    # Get current price to calculate shares
    price_data = get_price(ticker)
    price = price_data.get("price")
    
    if not price:
        return {"error": "Could not get price"}

    qty = amount_usd / price
    
    # Alpaca supports fractional shares for many stocks
    order = MarketOrderRequest(
        symbol=ticker,
        qty=qty,
        side=OrderSide.BUY if side == "BUY" else OrderSide.SELL,
        time_in_force=TimeInForce.DAY
    )
    
    try:
        order_result = client.submit_order(order)
        # Convert Alpaca order object to dict for easier tracking
        return {
            "id": str(order_result.id) if hasattr(order_result, 'id') else None,
            "status": str(order_result.status) if hasattr(order_result, 'status') else None,
            "filled_qty": float(order_result.filled_qty) if hasattr(order_result, 'filled_qty') else qty,
            "filled_avg_price": float(order_result.filled_avg_price) if hasattr(order_result, 'filled_avg_price') else price,
            "qty": float(order_result.qty) if hasattr(order_result, 'qty') else qty,
            "price": price,
            "symbol": ticker,
            "side": side
        }
    except Exception as e:
        print(f"Error executing trade: {e}")
        return {"error": str(e), "symbol": ticker, "side": side}

def get_alpaca_portfolio(model_id: str = None) -> dict:
    """
    Get current positions and account info from Alpaca.
    Note: This returns the shared Alpaca account data. For model-specific portfolios,
    use the portfolio tracking system in utils/portfolio.py instead.
    
    Args:
        model_id: Not used (kept for compatibility)
    """
    if not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
        return {"error": "Credentials missing"}

    client = TradingClient(ALPACA_API_KEY, ALPACA_SECRET_KEY, paper=ALPACA_PAPER)
    account = client.get_account()
    positions = client.get_all_positions()
    
    return {
        "cash": float(account.cash),
        "portfolio_value": float(account.portfolio_value),
        "positions": [
            {
                "ticker": p.symbol,
                "shares": float(p.qty),
                "market_value": float(p.market_value),
                "unrealized_pnl": float(p.unrealized_pl),
                "unrealized_pnl_pct": float(p.unrealized_plpc) * 100
            }
            for p in positions
        ]
    }

