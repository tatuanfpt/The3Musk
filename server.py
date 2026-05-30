import json
import mimetypes
import os
import pathlib
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROOT = pathlib.Path(__file__).resolve().parent


class Handler(BaseHTTPRequestHandler):
  def _send_json(self, status, payload):
    data = json.dumps(payload).encode("utf-8")
    self.send_response(status)
    self.send_header("Content-Type", "application/json; charset=utf-8")
    self.send_header("Content-Length", str(len(data)))
    self.send_header("Cache-Control", "no-store")
    self.end_headers()
    self.wfile.write(data)

  def _read_json(self):
    length = int(self.headers.get("Content-Length") or 0)
    raw = self.rfile.read(length) if length > 0 else b"{}"
    return json.loads(raw.decode("utf-8") or "{}")

  def do_POST(self):
    if self.path.split("?")[0] != "/api/gemini":
      self._send_json(404, {"error": "not_found"})
      return

    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
      self._send_json(
        501,
        {
          "error": "gemini_key_missing",
          "hint": "Set GOOGLE_API_KEY (or GEMINI_API_KEY) in environment before starting server.py",
        },
      )
      return

    try:
      body = self._read_json()
    except Exception:
      self._send_json(400, {"error": "invalid_json"})
      return

    prompt = (body.get("prompt") or "").strip()
    if not prompt:
      self._send_json(400, {"error": "missing_prompt"})
      return

    model = (body.get("model") or "gemini-1.5-flash").strip()
    temperature = float(body.get("temperature") if body.get("temperature") is not None else 0.2)
    max_output_tokens = int(body.get("max_output_tokens") or 512)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    req_body = {
      "contents": [{"role": "user", "parts": [{"text": prompt}]}],
      "generationConfig": {
        "temperature": temperature,
        "maxOutputTokens": max_output_tokens,
      },
    }

    req = urllib.request.Request(
      url,
      data=json.dumps(req_body).encode("utf-8"),
      headers={"Content-Type": "application/json"},
      method="POST",
    )

    try:
      with urllib.request.urlopen(req, timeout=30) as resp:
        resp_body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
      try:
        err = e.read().decode("utf-8")
      except Exception:
        err = ""
      self._send_json(502, {"error": "gemini_http_error", "status": e.code, "body": err})
      return
    except Exception:
      self._send_json(502, {"error": "gemini_request_failed"})
      return

    text = ""
    try:
      candidates = resp_body.get("candidates") or []
      content = candidates[0].get("content") if candidates else None
      parts = content.get("parts") if content else []
      text = (parts[0].get("text") if parts else "") or ""
    except Exception:
      text = ""

    self._send_json(200, {"text": text})

  def do_GET(self):
    path = self.path.split("?")[0]
    if path.startswith("/api/"):
      self._send_json(404, {"error": "not_found"})
      return

    if path == "/":
      path = "/index.html"

    target = (ROOT / path.lstrip("/")).resolve()
    if not str(target).startswith(str(ROOT)):
      self.send_error(403)
      return

    if not target.exists() or target.is_dir():
      self.send_error(404)
      return

    mime, _ = mimetypes.guess_type(str(target))
    if not mime:
      mime = "application/octet-stream"

    data = target.read_bytes()
    self.send_response(200)
    self.send_header("Content-Type", f"{mime}; charset=utf-8" if mime.startswith("text/") else mime)
    self.send_header("Content-Length", str(len(data)))
    self.send_header("Cache-Control", "no-store")
    self.end_headers()
    self.wfile.write(data)


def main():
  port = int(os.getenv("PORT") or 5173)
  server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
  server.serve_forever()


if __name__ == "__main__":
  main()

