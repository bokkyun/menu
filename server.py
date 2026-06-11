import json
import os
import socket
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
STATE_FILE = os.path.join(ROOT, "selections.json")
PORT_FILE = os.path.join(ROOT, "port.txt")
lock = threading.Lock()


def load_state():
    if not os.path.exists(STATE_FILE):
        return {"rooms": {}}
    with open(STATE_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def save_state(state):
    with open(STATE_FILE, "w", encoding="utf-8") as file:
        json.dump(state, file, ensure_ascii=False, indent=2)


def find_available_port(start=8080, end=8090):
    for port in range(start, end + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind(("0.0.0.0", port))
                return port
            except OSError:
                continue
    return None


class MenuHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, format, *args):
        if str(args[0]).startswith("GET /api/"):
            return
        super().log_message(format, *args)

    def _send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self):
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            self._send_json({"ok": True})
            return
        if parsed.path.startswith("/api/room/"):
            room_id = unquote(parsed.path.split("/api/room/", 1)[1])
            with lock:
                state = load_state()
                room = state["rooms"].get(room_id, {"users": {}, "updatedAt": 0})
            self._send_json(room)
            return
        return super().do_GET()

    def do_PUT(self):
        parsed = urlparse(self.path)
        prefix = "/api/room/"
        if parsed.path.startswith(prefix):
            parts = unquote(parsed.path[len(prefix) :]).split("/user/")
            if len(parts) != 2:
                self._send_json({"error": "invalid path"}, 400)
                return

            room_id, user_name = parts[0], parts[1]
            payload = self._read_json()
            selections = payload.get("selections", {})

            with lock:
                state = load_state()
                room = state["rooms"].setdefault(room_id, {"users": {}, "updatedAt": 0})
                room["users"][user_name] = {
                    "selections": selections,
                    "updatedAt": payload.get("updatedAt", 0),
                }
                room["updatedAt"] = payload.get("updatedAt", 0)
                state["rooms"][room_id] = room
                save_state(state)

            self._send_json({"ok": True})
            return

        self._send_json({"error": "not found"}, 404)

    def do_DELETE(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/room/"):
            room_id = unquote(parsed.path.split("/api/room/", 1)[1])
            with lock:
                state = load_state()
                state["rooms"].pop(room_id, None)
                save_state(state)
            self._send_json({"ok": True})
            return
        self._send_json({"error": "not found"}, 404)


def main():
    if "PORT" in os.environ:
        port = int(os.environ["PORT"])
    else:
        port = find_available_port(8080, 8090)
        if port is None:
            print("사용 가능한 포트를 찾지 못했습니다. 8080~8090 포트를 확인해주세요.", file=sys.stderr)
            sys.exit(1)

    server = ThreadingHTTPServer(("0.0.0.0", port), MenuHandler)
    try:
        with open(PORT_FILE, "w", encoding="utf-8") as file:
            file.write(str(port))
    except OSError:
        pass

    print(f"Serving at http://localhost:{port}")
    if port != preferred:
        print(f"(포트 {preferred}이 사용 중이어서 {port}로 실행합니다)")
    print("종료하려면 Ctrl+C 를 누르세요.")
    sys.stdout.flush()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n서버를 종료합니다.")
        server.server_close()


if __name__ == "__main__":
    main()
