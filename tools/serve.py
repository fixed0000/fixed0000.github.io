"""Preview the GitHub Pages root, including its custom missing-page behavior."""
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
import argparse,os

class Handler(SimpleHTTPRequestHandler):
    def send_error(self,code,message=None,explain=None):
        if code!=404:return super().send_error(code,message,explain)
        body=Path('404.html').read_bytes()
        self.send_response(404)
        self.send_header('Content-Type','text/html; charset=utf-8')
        self.send_header('Content-Length',str(len(body)))
        self.end_headers()
        if self.command!='HEAD':self.wfile.write(body)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8000);args=parser.parse_args()
    os.chdir(Path(__file__).resolve().parents[1])
    print(f'Local: http://localhost:{args.port}/',flush=True)
    ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
