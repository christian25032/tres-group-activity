import datetime
import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs
from pathlib import Path
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parent
API_KEY = os.environ.get('ABSTRACT_API_KEY', 'aba48efde4a846efb076883f1a4bcff2')

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/holidays':
            self.handle_holidays(parsed)
            return

        if parsed.path == '/':
            self.path = 'index.html'
        else:
            self.path = parsed.path.lstrip('/')

        return super().do_GET()

    def handle_holidays(self, parsed):
        params = parse_qs(parsed.query)
        country = (params.get('country', ['US'])[0] or 'US').upper()
        year = params.get('year', [''])[0] or str(datetime.date.today().year)
        month = params.get('month', [''])[0]
        day = params.get('day', [''])[0]

        url = f'https://holidays.abstractapi.com/v1/?api_key={API_KEY}&country={country}&year={year}'
        if month:
            url += f'&month={month}'
        if day:
            url += f'&day={day}'

        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            with urllib.request.urlopen(req, timeout=20) as response:
                payload = response.read().decode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(payload.encode('utf-8'))
                return
        except urllib.error.HTTPError as exc:
            self.send_response(exc.code)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'API error', 'detail': exc.read().decode('utf-8', 'ignore')}).encode('utf-8'))
            return
        except Exception as exc:
            self.send_response(502)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Failed to reach holidays API', 'detail': str(exc)}).encode('utf-8'))
            return

    def log_message(self, format, *args):
        return

if __name__ == '__main__':
    port = int(os.environ.get('PORT', '3000'))
    server = ThreadingHTTPServer(('0.0.0.0', port), Handler)
    print(f'Holiday app running at http://localhost:{port}')
    server.serve_forever()
