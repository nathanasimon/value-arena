import json
import os
import tempfile
from datetime import datetime
from .config import MODELS

# Use /tmp directory for Vercel serverless compatibility
# Note: This storage is ephemeral and will be lost between cold starts.
# For production persistence, use Vercel KV or a database.
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
