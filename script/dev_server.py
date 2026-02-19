#!/usr/bin/env python3
"""
Local static server for this repo.

Why this exists:
- On Windows, `python -m http.server` can serve `.js` as `text/plain`,
  which causes browsers to block scripts.
"""

from __future__ import annotations

import argparse
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent.parent


class DevRequestHandler(SimpleHTTPRequestHandler):
    # Force web-safe MIME mappings across platforms.
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".css": "text/css",
        ".html": "text/html",
        ".ico": "image/x-icon",
        ".js": "application/javascript",
        ".json": "application/json",
        ".mjs": "application/javascript",
        ".png": "image/png",
        ".svg": "image/svg+xml",
        ".txt": "text/plain",
        ".wasm": "application/wasm",
        ".webp": "image/webp",
    }

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run local website dev server.")
    parser.add_argument("--host", default="127.0.0.1", help="Host to bind.")
    parser.add_argument("--port", type=int, default=5173, help="Port to bind.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    os.chdir(ROOT_DIR)
    handler = partial(DevRequestHandler, directory=str(ROOT_DIR))
    server = ThreadingHTTPServer((args.host, args.port), handler)

    print(
        f"Serving {ROOT_DIR} on http://{args.host}:{args.port}/ "
        "(Ctrl+C to stop)"
    )

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
