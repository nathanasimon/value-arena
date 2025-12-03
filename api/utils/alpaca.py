from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce
from .config import ALPACA_API_KEY, ALPACA_SECRET_KEY, ALPACA_PAPER
from .research import get_price

def execute_trade(ticker: str, side: str, amount_usd: float) -> dict:
    """Execute a trade via Alpaca paper trading."""
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
    
    return client.submit_order(order)

def get_alpaca_portfolio() -> dict:
    """Get current positions and account info."""
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

