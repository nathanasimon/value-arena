import os
from dotenv import load_dotenv

load_dotenv()

MODELS = [
    {"id": "openai/gpt-5.1", "display": "GPT 5.1"},
    {"id": "anthropic/claude-opus-4.5", "display": "Claude Opus 4.5"},
    {"id": "google/gemini-3-pro-preview", "display": "Gemini 3 Pro"},
    {"id": "deepseek/deepseek-v3.2", "display": "DeepSeek V3.2"},
    {"id": "x-ai/grok-4.1-fast", "display": "Grok 4.1"},
    {"id": "qwen/qwen3-max", "display": "Qwen 3 Max"},
    {"id": "moonshotai/kimi-k2-thinking", "display": "Kimi k2"}
]

ALPACA_API_KEY = os.environ.get("ALPACA_API_KEY")
ALPACA_SECRET_KEY = os.environ.get("ALPACA_SECRET_KEY")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
ALPACA_PAPER = True

# Safety Limits
MAX_DAILY_SPEND = 2.00 # Maximum USD to spend on LLM calls per day
MAX_TOKENS_PER_RUN = 4000
