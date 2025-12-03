from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

from api.utils.portfolio import get_all_portfolios, load_portfolio
from api.run_daily import run_daily_review

PORT = 5328

class DevHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query_params = parse_qs(parsed_path.query)
        
        response_data = {}

        try:
            if path == "/api/portfolios" or path == "/api/portfolio":
                if "id" in query_params:
                    model_id = query_params["id"][0]
                    response_data = load_portfolio(model_id)
                else:
                    response_data = get_all_portfolios()
            
            elif path == "/api/run_daily":
                summary = run_daily_review()
                response_data = {"status": "complete", "results": summary}
            
            else:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response_data = {"error": "Not found"}
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
                return
        
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"Error in API handler: {e}")
            print(error_trace)
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response_data = {"error": str(e), "message": "Internal server error"}
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
            return
        
        # Success response
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response_data, default=str).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        self.end_headers()

print(f"Starting Python API server on port {PORT}...")
httpd = HTTPServer(('localhost', PORT), DevHandler)
httpd.serve_forever()

