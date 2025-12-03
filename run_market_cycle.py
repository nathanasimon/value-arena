import asyncio
import os
import sys

# Add repo root to path
sys.path.append(os.getcwd())

from api.run_daily import run_daily_review

def main():
    print("Starting Daily Market Cycle...")
    print(f"Time: {os.environ.get('github_event_time', 'Now')}")
    
    # Run the synchronous loop
    results = run_daily_review()
    
    print("\n--- Cycle Complete ---")
    print(results)
    
    # Exit with error if any model failed completely (optional, keeping 0 to allow commit of partials)
    sys.exit(0)

if __name__ == "__main__":
    main()

