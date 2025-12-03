import os
import json
import time
from openai import OpenAI
from .config import OPENROUTER_API_KEY, MAX_DAILY_SPEND

# Global estimated spend tracker for this process run
current_run_spend = 0.0

# Approximate costs per 1k tokens (blended input/output for simplicity)
# Adjust based on actual model pricing
MODEL_COSTS = {
    "gpt-5.1": 0.06, # Placeholder high cost
    "claude-sonnet-4-5": 0.015,
    "gemini-3-pro": 0.002,
    "deepseek-chat-v3.1": 0.001,
    "grok-4": 0.01,
    "qwen3-max": 0.005,
    "kimi-k2-thinking": 0.005,
    "openai/gpt-3.5-turbo": 0.001 # Fallback
}

def estimate_cost(model: str, prompt_tokens: int, completion_tokens: int) -> float:
    # Simple estimator. OpenRouter returns exact cost in headers usually, but SDK might abstract it.
    # We'll try to use a generic safe average or specific if known.
    rate = 0.01 # Default $0.01 per 1k tokens
    
    for key, cost in MODEL_COSTS.items():
        if key in model:
            rate = cost
            break
            
    total_tokens = prompt_tokens + completion_tokens
    return (total_tokens / 1000) * rate

def call_openrouter(model: str, system: str, tools_schema: list, tool_map: dict, max_tokens: int = 4000):
    global current_run_spend
    
    if current_run_spend >= MAX_DAILY_SPEND:
        print(f"DAILY SPEND LIMIT REACHED (${current_run_spend:.4f} / ${MAX_DAILY_SPEND}). Stopping LLM calls.")
        return "{}"

    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_API_KEY,
    )
    
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": "Please review the portfolio and market conditions for today. Use your research tools to gather data, then output your analysis and trading decisions in the specified JSON format."}
    ]
    
    # Tool loop
    for _ in range(10): # Max 10 turns
        if current_run_spend >= MAX_DAILY_SPEND:
             print("Limit reached during loop.")
             break

        try:
            completion = client.chat.completions.create(
                model=model,
                messages=messages,
                tools=tools_schema,
                max_tokens=max_tokens
            )
            
            # Estimate cost
            usage = completion.usage
            if usage:
                cost = estimate_cost(model, usage.prompt_tokens, usage.completion_tokens)
                current_run_spend += cost
                print(f"  > Call cost: ${cost:.4f} | Total Run: ${current_run_spend:.4f}")
            
            message = completion.choices[0].message
            messages.append(message) # Add assistant message to history
            
            if message.tool_calls:
                for tool_call in message.tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)
                    
                    if function_name in tool_map:
                        print(f"Executing {function_name} with {function_args}")
                        func = tool_map[function_name]
                        try:
                            result = func(**function_args)
                            content = json.dumps(result, default=str)
                        except Exception as e:
                            content = f"Error executing {function_name}: {e}"
                    else:
                        content = f"Error: Tool {function_name} not found."
                    
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": content
                    })
            else:
                # No more tool calls, return content
                return message.content

        except Exception as e:
            print(f"LLM Loop Error: {e}")
            return "{}"
            
    # If we fall out of loop (hit max turns) or break
    if len(messages) > 0 and hasattr(messages[-1], 'content'):
        return messages[-1].content
    return "{}"
