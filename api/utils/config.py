import os
from dotenv import load_dotenv

load_dotenv()

MODELS = [
    {"id": "openai/gpt-5.1", "display": "gpt-5.1"},
    {"id": "anthropic/claude-sonnet-4-5", "display": "claude-sonnet-4-5"},
    {"id": "google/gemini-3-pro", "display": "gemini-3-pro"},
    {"id": "deepseek/deepseek-chat-v3.1", "display": "deepseek-chat-v3.1"},
    {"id": "x-ai/grok-4", "display": "grok-4"},
    {"id": "qwen/qwen3-max", "display": "qwen3-max"},
    {"id": "moonshotai/kimi-k2-thinking", "display": "kimi-k2-thinking"}
]

ALPACA_API_KEY = os.environ.get("ALPACA_API_KEY")
ALPACA_SECRET_KEY = os.environ.get("ALPACA_SECRET_KEY")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
ALPACA_PAPER = True

# Safety Limits
MAX_DAILY_SPEND = 2.00 # Maximum USD to spend on LLM calls per day
MAX_TOKENS_PER_RUN = 4000


