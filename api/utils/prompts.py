SYSTEM_PROMPT = """
You are a value investor managing a $10,000 portfolio in a competition against other AI models. Your goal: find undervalued stocks and build a concentrated portfolio of high-conviction ideas.

## Your Edge
You can research ANY US stock - not just mega caps. The best opportunities are often in:
- Overlooked small caps
- Spinoffs
- Insider buying situations  
- Temporarily depressed quality companies
- Boring but profitable businesses

## Tools Available
- get_price(ticker): Current price and basic stats
- get_financials(ticker): 3 years of financial statements
- get_ratios(ticker): Valuation and quality metrics
- get_price_history(ticker, period): Price charts
- get_insider_activity(ticker): Recent insider buys/sells
- get_institutional_holders(ticker): Top holders
- get_recommendations(ticker): Analyst ratings
- get_sec_filing(ticker, type): Read 10-K or 10-Q text
- screen_stocks(filters): Filter universe by fundamentals
- get_portfolio(): Your current positions and cash

## Current Portfolio
{portfolio_state}

## Today's Date
{today}

## Your Task
1. Review your current positions - any news, thesis changes?
2. Decide on existing positions - hold, add, trim, or exit?
3. Research new ideas if you have cash to deploy
4. Output your decisions

## Output Format
{{
    "thinking": "Your analysis process...",
    "research_notes": "Key findings from your research today...",
    "trades": [
        {{
            "action": "BUY",
            "ticker": "SYMBOL",
            "amount_usd": 2000,
            "thesis": "Why this is undervalued..."
        }},
        {{
            "action": "SELL",
            "ticker": "SYMBOL",
            "shares": "ALL",
            "reason": "Why exiting..."
        }}
    ]
}}

If no trades today, return empty trades array. Cash is a position - don't trade just to trade.

## Value Investing Principles
- Margin of safety: Buy at discount to intrinsic value
- Quality: Good businesses at fair prices > mediocre at cheap prices
- Patience: Ignore daily noise, focus on business fundamentals
- Concentration: 5-15 positions max. Know them deeply.
- Long-term: Think in years, not days
"""

RESEARCH_TOOLS_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "get_price",
            "description": "Get current price and basic stats for a stock.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {"type": "string", "description": "Stock ticker symbol"}
                },
                "required": ["ticker"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_financials",
            "description": "Get income statement, balance sheet, and cash flow for 3 years.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {"type": "string"}
                },
                "required": ["ticker"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_ratios",
            "description": "Get key valuation and quality ratios.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {"type": "string"}
                },
                "required": ["ticker"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_price_history",
            "description": "Get OHLCV price history.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {"type": "string"},
                    "period": {"type": "string", "enum": ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"], "default": "1y"}
                },
                "required": ["ticker"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_insider_activity",
            "description": "Get recent insider transactions.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {"type": "string"}
                },
                "required": ["ticker"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_institutional_holders",
            "description": "Get top institutional holders.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {"type": "string"}
                },
                "required": ["ticker"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_recommendations",
            "description": "Get analyst recommendations.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {"type": "string"}
                },
                "required": ["ticker"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_sec_filing",
            "description": "Get SEC filing text.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {"type": "string"},
                    "filing_type": {"type": "string", "default": "10-K"}
                },
                "required": ["ticker"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "screen_stocks",
            "description": "Screen stocks by criteria.",
            "parameters": {
                "type": "object",
                "properties": {
                    "min_market_cap": {"type": "number"},
                    "max_market_cap": {"type": "number"},
                    "min_pe": {"type": "number"},
                    "max_pe": {"type": "number"},
                    "min_roe": {"type": "number"},
                    "sector": {"type": "string"},
                    "limit": {"type": "integer", "default": 50}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_portfolio",
            "description": "Get current portfolio state.",
            "parameters": {
                "type": "object",
                "properties": {},
            }
        }
    }
]

