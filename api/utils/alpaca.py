from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce
from .config import ALPACA_PAPER, get_alpaca_credentials
from .research import get_price

def execute_trade(ticker: str, side: str, amount_usd: float, model_id: str = None) -> dict:
    """
    Execute a trade via Alpaca paper trading.
    
    Args:
        ticker: Stock ticker symbol
        side: "BUY" or "SELL"
        amount_usd: Dollar amount to trade
        model_id: Optional model ID to use model-specific Alpaca account
    """
    api_key, secret_key = get_alpaca_credentials(model_id) if model_id else get_alpaca_credentials("")
    
    if not api_key or not secret_key:
        print(f"Alpaca credentials missing for model: {model_id or 'default'}")
        return {"error": "Credentials missing"}

    client = TradingClient(api_key, secret_key, paper=ALPACA_PAPER)
    
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

def get_alpaca_portfolio(model_id: str = None) -> dict:
    """
    Get current positions and account info.
    
    Args:
        model_id: Optional model ID to use model-specific Alpaca account
    """
    api_key, secret_key = get_alpaca_credentials(model_id) if model_id else get_alpaca_credentials("")
    
    if not api_key or not secret_key:
        return {"error": f"Credentials missing for model: {model_id or 'default'}"}

    client = TradingClient(api_key, secret_key, paper=ALPACA_PAPER)
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

