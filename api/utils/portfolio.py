import json
import os
from datetime import datetime
from .config import MODELS

DATA_DIR = os.path.join(os.getcwd(), "data", "portfolios")

def ensure_data_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

def get_portfolio_path(model_id: str) -> str:
    ensure_data_dir()
    safe_id = model_id.replace("/", "_")
    return os.path.join(DATA_DIR, f"{safe_id}.json")

def load_portfolio(model_id: str) -> dict:
    path = get_portfolio_path(model_id)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    
    # Initialize if not exists
    return {
        "model_id": model_id,
        "starting_capital": 10000,
        "positions": [],
        "trade_history": [],
        "research_logs": [],
        "nav_history": [{"date": datetime.now().strftime("%Y-%m-%d"), "nav": 10000}]
    }

def save_portfolio(portfolio: dict):
    path = get_portfolio_path(portfolio["model_id"])
    with open(path, "w") as f:
        json.dump(portfolio, f, indent=4)

def update_nav(model_id: str, nav_value: float):
    portfolio = load_portfolio(model_id)
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Check if entry for today exists
    history = portfolio.get("nav_history", [])
    if history and history[-1]["date"] == today:
        history[-1]["nav"] = nav_value
    else:
        history.append({"date": today, "nav": nav_value})
    
    portfolio["nav_history"] = history
    save_portfolio(portfolio)

def log_trade(model_id: str, trade: dict, result: dict):
    portfolio = load_portfolio(model_id)
    
    # Add timestamp to trade
    trade_record = trade.copy()
    trade_record["date"] = datetime.now().isoformat()
    trade_record["result"] = str(result) # Store alpaca result
    
    portfolio["trade_history"].append(trade_record)
    
    # Update positions (simplified logic - better to sync with Alpaca)
    # In a real app, we might just rely on Alpaca for positions
    # But keeping a local shadow record is good for the "Why" (thesis)
    
    # Handle position update logic here if needed, or rely on daily sync
    
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

