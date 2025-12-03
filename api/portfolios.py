from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
import traceback

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Check if ID is in query params
            parsed_path = urlparse(self.path)
            query_params = parse_qs(parsed_path.query)
            
            # Import here to catch import errors gracefully
            from .utils.portfolio import get_all_portfolios, load_portfolio
            
            if "id" in query_params:
                model_id = query_params["id"][0]
                data = load_portfolio(model_id)
            else:
                data = get_all_portfolios()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(data, default=str).encode('utf-8'))
            
        except Exception as e:
            # Log the full error for debugging
            error_trace = traceback.format_exc()
            print(f"Error in portfolios API: {e}")
            print(error_trace)
            
            # Return error response
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {
                "error": str(e),
                "message": "Failed to load portfolios"
            }
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        self.end_headers()

