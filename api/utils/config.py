import os
from typing import Optional, Tuple
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

# Default Alpaca credentials (for backward compatibility)
ALPACA_API_KEY = os.environ.get("ALPACA_API_KEY")
ALPACA_SECRET_KEY = os.environ.get("ALPACA_SECRET_KEY")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
ALPACA_PAPER = True

def get_alpaca_credentials(model_id: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Get Alpaca API credentials for a specific model.
    Looks for model-specific keys first, falls back to default keys.
    
    Model-specific format: ALPACA_API_KEY_{MODEL_ID} and ALPACA_SECRET_KEY_{MODEL_ID}
    where MODEL_ID is the model ID with / replaced by _ (e.g., openai_gpt-5.1)
    """
    # Convert model_id to environment variable format (replace / with _)
    safe_model_id = model_id.replace("/", "_").replace("-", "_").upper()
    
    # Try model-specific keys first
    model_api_key = os.environ.get(f"ALPACA_API_KEY_{safe_model_id}")
    model_secret_key = os.environ.get(f"ALPACA_SECRET_KEY_{safe_model_id}")
    
    if model_api_key and model_secret_key:
        return (model_api_key, model_secret_key)
    
    # Fall back to default keys
    return (ALPACA_API_KEY, ALPACA_SECRET_KEY)

# Safety Limits
MAX_DAILY_SPEND = 2.00 # Maximum USD to spend on LLM calls per day
MAX_TOKENS_PER_RUN = 4000
