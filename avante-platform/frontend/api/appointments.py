"""Vercel Serverless Function — Appointments CRUD via Supabase REST API."""
from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.request
import urllib.parse

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

def _headers(extra=None):
    h = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    if extra:
        h.update(extra)
    return h

def _request(method, path, body=None, headers_extra=None):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=_headers(headers_extra), method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode()) if e.read else {"error": str(e)}

def _cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

class handler(BaseHTTPRequestHandler):
    def _send(self, code, data):
        self.send_response(code)
        for k, v in _cors_headers().items():
            self.send_header(k, v)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data, default=str).encode())

    def do_OPTIONS(self):
        self._send(200, {})

    def do_GET(self):
        params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        apt_id = params.get("id", [None])[0]
        user_id = params.get("user_id", ["local_user"])[0]
        limit = params.get("limit", ["500"])[0]

        if apt_id:
            status, data = _request("GET", f"appointments?id=eq.{apt_id}&limit=1", headers_extra={"Accept": "application/json"})
            if isinstance(data, list) and data:
                self._send(200, data[0])
            else:
                self._send(404, {"error": "Not found"})
        else:
            path = f"appointments?user_id=eq.{user_id}&order=fecha.asc&limit={limit}"
            status, data = _request("GET", path, headers_extra={"Accept": "application/json"})
            items = data if isinstance(data, list) else []
            self._send(200, {"items": items, "total": len(items)})

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length else {}
        body.setdefault("user_id", "local_user")

        status, data = _request("POST", "appointments", body, {"Prefer": "return=representation"})
        if isinstance(data, list) and data:
            self._send(201, data[0])
        else:
            self._send(status, data)

    def do_PUT(self):
        params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        apt_id = params.get("id", [None])[0]
        if not apt_id:
            self._send(400, {"error": "id required"})
            return

        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length else {}
        body.pop("id", None)
        body.pop("user_id", None)

        status, data = _request("PATCH", f"appointments?id=eq.{apt_id}", body, {"Prefer": "return=representation"})
        if isinstance(data, list) and data:
            self._send(200, data[0])
        else:
            self._send(status, data)

    def do_DELETE(self):
        params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        apt_id = params.get("id", [None])[0]
        if not apt_id:
            self._send(400, {"error": "id required"})
            return

        status, data = _request("DELETE", f"appointments?id=eq.{apt_id}")
        self._send(200, {"message": "Deleted", "id": apt_id})
