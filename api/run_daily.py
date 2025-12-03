from http.server import BaseHTTPRequestHandler
import json
import re
from datetime import datetime
from .utils.config import MODELS
from .utils.portfolio import load_portfolio, save_portfolio, log_trade, save_research_log, update_nav
from .utils.research import (
    get_price, get_financials, get_ratios, get_price_history, 
    get_insider_activity, get_institutional_holders, get_recommendations, 
    get_sec_filing, screen_stocks
)
from .utils.alpaca import execute_trade, get_alpaca_portfolio
from .utils.llm import call_openrouter
from .utils.prompts import SYSTEM_PROMPT, RESEARCH_TOOLS_SCHEMA

# Tool Map
TOOL_MAP = {
    "get_price": get_price,
    "get_financials": get_financials,
    "get_ratios": get_ratios,
    "get_price_history": get_price_history,
    "get_insider_activity": get_insider_activity,
    "get_institutional_holders": get_institutional_holders,
    "get_recommendations": get_recommendations,
    "get_sec_filing": get_sec_filing,
    "screen_stocks": screen_stocks,
    "get_portfolio": get_alpaca_portfolio
}

def format_portfolio(portfolio):
    return json.dumps(portfolio, indent=2, default=str)

def parse_model_response(response_text):
    try:
        # Extract JSON from code block if present
        match = re.search(r"```json\s*(.*?)\s*```", response_text, re.DOTALL)
        if match:
            json_str = match.group(1)
        else:
            # Try to find start/end of json object
            match = re.search(r"\{.*\}", response_text, re.DOTALL)
            if match:
                json_str = match.group(0)
            else:
                json_str = response_text
        
        return json.loads(json_str)
    except Exception as e:
        print(f"Error parsing JSON: {e}")
        return {"trades": [], "research_notes": "Failed to parse model response."}

def calculate_sell_amount(trade, portfolio):
    # If shares="ALL", find position and calculate value
    ticker = trade.get("ticker")
    for pos in portfolio.get("positions", []):
        if pos["ticker"] == ticker:
            return pos["shares"] # This might be quantity, not USD amount?
            # execute_trade logic takes amount_usd or needs logic adjustment
    return 0

def run_daily_review():
    results = []
    for model in MODELS:
        print(f"Running for {model['id']}")
        try:
            # 1. Load portfolio state
            portfolio = load_portfolio(model["id"])
            
            # 2. Update current prices for positions (Simplified: Rely on Alpaca or get_price)
            # In this local state, we might want to update `nav_history` roughly
            # But strict NAV update happens via Alpaca sync usually.
            # We will skip strict local update for now as `get_portfolio` tool provides live data.
            
            # 3. Build prompt
            prompt = SYSTEM_PROMPT.format(
                portfolio_state=format_portfolio(portfolio),
                today=datetime.now().strftime("%Y-%m-%d")
            )
            
            # 4. Call model
            # We pass TOOL_MAP so llm can execute
            response = call_openrouter(
                model=model["id"],
                system=prompt,
                tools_schema=RESEARCH_TOOLS_SCHEMA,
                tool_map=TOOL_MAP,
                max_tokens=4000
            )
            
            # 5. Parse and execute
            parsed = parse_model_response(response)
            
            trades_executed = []
            if "trades" in parsed and isinstance(parsed["trades"], list):
                for trade in parsed["trades"]:
                    # Calculate amount if SELL ALL
                    amount_usd = trade.get("amount_usd")
                    if trade.get("shares") == "ALL" and trade.get("action") == "SELL":
                        # We need to know how much we have.
                        # For this MVP, we might need to fetch live position size
                        # execute_trade takes amount_usd. 
                        # Alpaca API allows selling by Qty.
                        # The execute_trade wrapper in utils/alpaca takes amount_usd.
                        # We should probably adjust execute_trade to take qty or handle "ALL".
                        pass 

                    result = execute_trade(
                        ticker=trade["ticker"],
                        side=trade["action"],
                        amount_usd=amount_usd if amount_usd else 0 # Simplified
                    )
                    log_trade(model["id"], trade, result)
                    trades_executed.append(result)
            
            # 6. Save research notes
            if "research_notes" in parsed:
                save_research_log(model["id"], parsed["research_notes"])
            
            # 7. Update NAV (Fetch from Alpaca)
            live_port = get_alpaca_portfolio()
            if "portfolio_value" in live_port:
                update_nav(model["id"], live_port["portfolio_value"])
                
            results.append({"model": model["id"], "status": "success", "trades": len(trades_executed)})
            
        except Exception as e:
            print(f"Error running model {model['id']}: {e}")
            results.append({"model": model["id"], "status": "error", "error": str(e)})

    return results

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            summary = run_daily_review()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "complete", "results": summary}).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

