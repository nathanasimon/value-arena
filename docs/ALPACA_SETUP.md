# Setting Up Multiple Alpaca Accounts for Each Model

To track each AI model's performance independently, you'll need to create separate Alpaca Paper Trading accounts (one per model) and configure API keys for each.

## Step 1: Create Alpaca Accounts

For each of the 7 models, you'll need to create a separate Alpaca Paper Trading account:

1. **Visit**: https://app.alpaca.markets/signup
2. **Sign up** with a unique email for each model (you can use email aliases like `yourname+model1@gmail.com`)
3. **Complete verification** (KYC process - typically 1-3 business days)
4. **Generate API Keys** for each account:
   - Go to: https://app.alpaca.markets/paper/dashboard/overview
   - Navigate to API Keys section
   - Generate new keys (Paper Trading keys)

## Step 2: Configure Environment Variables

Add the API keys to your `.env` file using this format:

```env
# Default/fallback keys (for backward compatibility)
ALPACA_API_KEY=your_default_key
ALPACA_SECRET_KEY=your_default_secret

# Model-specific keys (format: ALPACA_API_KEY_{MODEL_ID})
# Model ID format: replace / with _ and - with _, convert to uppercase

# GPT 5.1
ALPACA_API_KEY_OPENAI_GPT_5_1=key_for_gpt_account
ALPACA_SECRET_KEY_OPENAI_GPT_5_1=secret_for_gpt_account

# Claude Opus 4.5
ALPACA_API_KEY_ANTHROPIC_CLAUDE_OPUS_4_5=key_for_claude_account
ALPACA_SECRET_KEY_ANTHROPIC_CLAUDE_OPUS_4_5=secret_for_claude_account

# Gemini 3 Pro
ALPACA_API_KEY_GOOGLE_GEMINI_3_PRO_PREVIEW=key_for_gemini_account
ALPACA_SECRET_KEY_GOOGLE_GEMINI_3_PRO_PREVIEW=secret_for_gemini_account

# DeepSeek V3.2
ALPACA_API_KEY_DEEPSEEK_DEEPSEEK_V3_2=key_for_deepseek_account
ALPACA_SECRET_KEY_DEEPSEEK_DEEPSEEK_V3_2=secret_for_deepseek_account

# Grok 4.1
ALPACA_API_KEY_X_AI_GROK_4_1_FAST=key_for_grok_account
ALPACA_SECRET_KEY_X_AI_GROK_4_1_FAST=secret_for_grok_account

# Qwen 3 Max
ALPACA_API_KEY_QWEN_QWEN3_MAX=key_for_qwen_account
ALPACA_SECRET_KEY_QWEN_QWEN3_MAX=secret_for_qwen_account

# Kimi k2
ALPACA_API_KEY_MOONSHOTAI_KIMI_K2_THINKING=key_for_kimi_account
ALPACA_SECRET_KEY_MOONSHOTAI_KIMI_K2_THINKING=secret_for_kimi_account
```

## Step 3: Sync to GitHub Environment Secrets

After updating your `.env` file, sync all keys to GitHub:

```bash
./sync_env_to_github.sh
```

Or manually add each key to GitHub:
- Go to: Settings → Environments → `env` → Environment secrets
- Add each `ALPACA_API_KEY_{MODEL_ID}` and `ALPACA_SECRET_KEY_{MODEL_ID}`

## Step 4: Verify Setup

Test that each model's account is configured correctly:

```bash
python3 test_api_keys.py
```

Or run the GitHub Actions workflow: "Test API Keys"

## How It Works

- Each model gets its own Alpaca Paper Trading account
- Trades are executed in the model's dedicated account
- Portfolio tracking is independent per model
- The system falls back to default keys if model-specific keys aren't found

## Notes

- **Paper Trading**: All accounts should use Paper Trading (not live trading)
- **Starting Capital**: Each account starts with $100,000 in paper trading
- **Email Aliases**: Use email aliases (e.g., `youremail+model1@gmail.com`) to create multiple accounts with one email provider
- **Account Names**: Consider naming accounts after the model (e.g., "GPT-5.1 Portfolio") for easy identification

