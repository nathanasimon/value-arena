from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
from .utils.portfolio import get_all_portfolios, load_portfolio

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Check if ID is in query params
        parsed_path = urlparse(self.path)
        query_params = parse_qs(parsed_path.query)
        
        if "id" in query_params:
            model_id = query_params["id"][0]
            data = load_portfolio(model_id)
        else:
            data = get_all_portfolios()
            
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data, default=str).encode('utf-8'))

