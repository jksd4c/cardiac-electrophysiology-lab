"""Loopback-only preview, independent of an interactive development terminal."""
# SPDX-License-Identifier: GPL-3.0-only
# Copyright (C) 2026 jksd4c
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.request import urlopen
import argparse
import json
import subprocess
import sys
import threading
import webbrowser

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / 'outputs' / 'local-v1.0.html'
ROUTE = '/outputs/local-v1.0.html'
IDENTITY = 'cardiac-electrophysiology-lab-local-v1.0'


class PreviewHandler(BaseHTTPRequestHandler):
    def log_message(self, *_args):
        pass  # pythonw intentionally has no interactive output stream.

    def do_HEAD(self):
        self.respond(head=True)

    def do_GET(self):
        self.respond()

    def respond(self, head=False):
        route = self.path.split('?', 1)[0]
        if route == '/__heart_local_health':
            body = json.dumps({'app': IDENTITY, 'version': 'local-v1.0'}).encode()
            content_type = 'application/json; charset=utf-8'
        elif route in ('/', ROUTE):
            body = PAGE.read_bytes()
            content_type = 'text/html; charset=utf-8'
        elif route == '/favicon.ico':
            self.send_response(204)
            self.end_headers()
            return
        else:
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        if not head:
            self.wfile.write(body)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--open', action='store_true', help='Open the preview in the default browser')
    args = parser.parse_args()
    if not PAGE.is_file():
        subprocess.run([sys.executable, str(ROOT / 'work' / 'build.py'), '--local'],
                       check=True, stdout=subprocess.DEVNULL)
    url = 'http://127.0.0.1:8780' + ROUTE
    try:
        with urlopen('http://127.0.0.1:8780/__heart_local_health', timeout=2) as response:
            already_running = json.load(response).get('app') == IDENTITY
    except Exception:
        already_running = False
    if already_running:
        if args.open:
            webbrowser.open(url)
        return
    server = ThreadingHTTPServer(('127.0.0.1', 8780), PreviewHandler)
    if args.open:
        # Serving must begin before the browser's first request arrives.
        threading.Timer(.3, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
