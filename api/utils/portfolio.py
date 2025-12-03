import json
import os
import tempfile
from datetime import datetime
from .config import MODELS

# Use persistent directory for GitHub Actions (data/portfolios)
# Falls back to temp directory for local development
if os.environ.get("GITHUB_ACTIONS"):
    DATA_DIR = os.path.join(os.getcwd(), "data", "portfolios")
else:
    # Local development: use temp directory
    DATA_DIR = os.path.join(tempfile.gettempdir(), "value_arena_data")

def ensure_data_dir():
    if not os.path.exists(DATA_DIR):
        try:
            os.makedirs(DATA_DIR)
        except Exception as e:
            print(f"Warning: Could not create data dir {DATA_DIR}: {e}")

def get_portfolio_path(model_id: str) -> str:
    ensure_data_dir()
    safe_id = model_id.replace("/", "_")
    return os.path.join(DATA_DIR, f"{safe_id}.json")

def load_portfolio(model_id: str) -> dict:
    try:
        path = get_portfolio_path(model_id)
        if os.path.exists(path):
            with open(path, "r") as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading portfolio {model_id}: {e}")
    
    # Initialize if not exists or error
    return {
        "model_id": model_id,
        "starting_capital": 10000,
        "positions": [],
        "trade_history": [],
        "research_logs": [],
        "nav_history": [{"date": datetime.now().strftime("%Y-%m-%d"), "nav": 10000}]
    }

def save_portfolio(portfolio: dict):
    try:
        path = get_portfolio_path(portfolio["model_id"])
        with open(path, "w") as f:
            json.dump(portfolio, f, indent=4)
    except Exception as e:
        print(f"Error saving portfolio {portfolio['model_id']}: {e}")

def calculate_cash_balance(model_id: str) -> float:
    """
    Calculate cash balance from trade history.
    """
    portfolio = load_portfolio(model_id)
    starting_capital = portfolio.get("starting_capital", 10000)
    cash = starting_capital
    
    # Process all trades to calculate cash
    for trade in portfolio.get("trade_history", []):
        action = trade.get("action", "").upper()
        amount_usd = trade.get("amount_usd", 0)
        
        # Try to get actual trade value from result
        result = trade.get("result", "")
        if isinstance(result, dict):
            filled_price = result.get("filled_avg_price") or result.get("price")
            filled_qty = result.get("filled_qty") or result.get("qty")
            if filled_price and filled_qty:
                amount_usd = float(filled_price) * float(filled_qty)
        
        if action == "BUY":
            cash -= amount_usd
        elif action == "SELL":
            cash += amount_usd
    
    return cash

def calculate_nav_from_positions(model_id: str) -> float:
    """
    Calculate NAV from tracked positions and cash.
    Updates position prices from market data.
    """
    portfolio = load_portfolio(model_id)
    
    # Update position prices
    try:
        from .research import get_price
        
        updated_positions = []
        for pos in portfolio.get("positions", []):
            ticker = pos["ticker"]
            shares = pos.get("shares", 0)
            
            # Get current price
            price_data = get_price(ticker)
            current_price = price_data.get("price", pos.get("entry_price", 0))
            
            entry_price = pos.get("entry_price", current_price)
            market_value = shares * current_price
            unrealized_pnl = (current_price - entry_price) * shares
            unrealized_pnl_pct = ((current_price - entry_price) / entry_price) * 100 if entry_price > 0 else 0
            
            updated_positions.append({
                "ticker": ticker,
                "shares": shares,
                "entry_price": entry_price,
                "market_value": market_value,
                "unrealized_pnl": unrealized_pnl,
                "unrealized_pnl_pct": unrealized_pnl_pct,
                "thesis": pos.get("thesis", "")
            })
        
        portfolio["positions"] = updated_positions
        save_portfolio(portfolio)
    except Exception as e:
        print(f"Error updating positions: {e}")
    
    # Calculate NAV = cash + position values
    cash = calculate_cash_balance(model_id)
    total_position_value = sum(p.get("market_value", 0) for p in portfolio.get("positions", []))
    nav = cash + total_position_value
    
    return nav

def update_nav(model_id: str, nav_value: float = None):
    """
    Update NAV for a model. If nav_value is None, calculates from positions.
    """
    portfolio = load_portfolio(model_id)
    today = datetime.now().strftime("%Y-%m-%d")
    
    if nav_value is None:
        nav_value = calculate_nav_from_positions(model_id)
    
    # Check if entry for today exists
    history = portfolio.get("nav_history", [])
    if history and history[-1]["date"] == today:
        history[-1]["nav"] = nav_value
    else:
        history.append({"date": today, "nav": nav_value})
    
    portfolio["nav_history"] = history
    save_portfolio(portfolio)

def update_position_after_trade(portfolio: dict, trade: dict, result: dict, current_price: float):
    """
    Update portfolio positions after a trade is executed.
    
    Args:
        portfolio: Portfolio dict (will be modified in place)
        trade: Trade dict with ticker, action, amount_usd, shares, etc.
        result: Alpaca API result
        current_price: Current market price of the stock
    """
    ticker = trade.get("ticker")
    action = trade.get("action", "").upper()
    
    # Calculate shares from amount_usd or use provided shares
    amount_usd = trade.get("amount_usd", 0)
    shares = trade.get("shares")
    
    if shares == "ALL":
        # Find existing position and sell all
        for pos in portfolio["positions"]:
            if pos["ticker"] == ticker:
                shares = pos["shares"]
                break
        if not shares:
            print(f"Warning: Trying to sell ALL shares of {ticker} but no position found")
            return
    
    if not shares and current_price > 0:
        shares = amount_usd / current_price
    
    if not shares or shares <= 0:
        print(f"Warning: Invalid shares amount for {ticker}: {shares}")
        return
    
    # Find existing position
    position_index = None
    for i, pos in enumerate(portfolio["positions"]):
        if pos["ticker"] == ticker:
            position_index = i
            break
    
    if action == "BUY":
        if position_index is not None:
            # Update existing position
            old_pos = portfolio["positions"][position_index]
            old_shares = old_pos["shares"]
            old_cost_basis = old_pos.get("entry_price", current_price) * old_shares
            new_cost_basis = current_price * shares
            total_shares = old_shares + shares
            # Weighted average entry price
            new_entry_price = (old_cost_basis + new_cost_basis) / total_shares
            
            portfolio["positions"][position_index] = {
                "ticker": ticker,
                "shares": total_shares,
                "entry_price": new_entry_price,
                "market_value": total_shares * current_price,
                "unrealized_pnl": (current_price - new_entry_price) * total_shares,
                "unrealized_pnl_pct": ((current_price - new_entry_price) / new_entry_price) * 100 if new_entry_price > 0 else 0,
                "thesis": trade.get("thesis", old_pos.get("thesis", ""))
            }
        else:
            # New position
            portfolio["positions"].append({
                "ticker": ticker,
                "shares": shares,
                "entry_price": current_price,
                "market_value": shares * current_price,
                "unrealized_pnl": 0,
                "unrealized_pnl_pct": 0,
                "thesis": trade.get("thesis", "")
            })
    
    elif action == "SELL":
        if position_index is not None:
            old_pos = portfolio["positions"][position_index]
            old_shares = old_pos["shares"]
            
            if shares >= old_shares:
                # Selling all or more - remove position
                portfolio["positions"].pop(position_index)
            else:
                # Partial sell - reduce shares
                remaining_shares = old_shares - shares
                portfolio["positions"][position_index] = {
                    "ticker": ticker,
                    "shares": remaining_shares,
                    "entry_price": old_pos.get("entry_price", current_price),  # Keep original entry price
                    "market_value": remaining_shares * current_price,
                    "unrealized_pnl": (current_price - old_pos.get("entry_price", current_price)) * remaining_shares,
                    "unrealized_pnl_pct": ((current_price - old_pos.get("entry_price", current_price)) / old_pos.get("entry_price", current_price)) * 100 if old_pos.get("entry_price", 0) > 0 else 0,
                    "thesis": old_pos.get("thesis", "")
                }
        else:
            print(f"Warning: Trying to sell {ticker} but no position found")
    
    # Don't save here - caller will save

def log_trade(model_id: str, trade: dict, result: dict):
    """
    Log a trade and update positions.
    """
    portfolio = load_portfolio(model_id)
    
    # Extract price BEFORE storing (since we need it for position update)
    ticker = trade.get("ticker")
    current_price = None
    
    # Try to get price from Alpaca result
    if isinstance(result, dict):
        if "filled_avg_price" in result and result["filled_avg_price"]:
            try:
                current_price = float(result["filled_avg_price"])
            except (ValueError, TypeError):
                pass
        elif "price" in result and result["price"]:
            try:
                current_price = float(result["price"])
            except (ValueError, TypeError):
                pass
    
    # If no price in result, fetch current price
    if not current_price:
        try:
            from .research import get_price
            price_data = get_price(ticker)
            current_price = price_data.get("price")
        except Exception as e:
            print(f"Warning: Could not get price for {ticker}: {e}")
            # Fallback: estimate from amount_usd
            amount_usd = trade.get("amount_usd", 0)
            shares = trade.get("shares")
            if shares and shares != "ALL":
                try:
                    shares_float = float(shares)
                    if shares_float > 0:
                        current_price = amount_usd / shares_float
                except (ValueError, TypeError):
                    pass
    
    # Update positions BEFORE saving trade record
    if current_price and current_price > 0:
        update_position_after_trade(portfolio, trade, result, current_price)
    else:
        print(f"Warning: Could not determine price for {ticker}, skipping position update")
    
    # Add timestamp to trade and store result as dict (not string)
    trade_record = trade.copy()
    trade_record["date"] = datetime.now().isoformat()
    trade_record["result"] = result if isinstance(result, dict) else {"raw": str(result)}  # Store as dict
    
    portfolio["trade_history"].append(trade_record)
    save_portfolio(portfolio)

def save_research_log(model_id: str, notes: str):
    portfolio = load_portfolio(model_id)
    portfolio["research_logs"].append({
        "date": datetime.now().strftime("%Y-%m-%d"),
        "notes": notes
    })
    save_portfolio(portfolio)

def get_all_portfolios():
    portfolios = []
    for model in MODELS:
        portfolios.append(load_portfolio(model["id"]))
    return portfolios
