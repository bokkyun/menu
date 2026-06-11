import html
import json
import re
from pathlib import Path
from urllib.parse import unquote

HTML_PATH = Path(__file__).parent / "naver-menu.html"


def decode_image_url(url: str) -> str:
    url = html.unescape(url)
    if "src=" in url:
        match = re.search(r"src=([^&]+)", url)
        if match:
            return unquote(match.group(1))
    return url


def parse_from_apollo(raw: str) -> list[dict]:
    start = raw.find('window.__APOLLO_STATE__ = ')
    end = raw.find('window.__PLACE_STATE__')
    if start == -1:
        return []

    blob = raw[start + len('window.__APOLLO_STATE__ = ') : end].strip()
    if blob.endswith(';'):
        blob = blob[:-1]

    data = json.loads(blob)
    items = []
    for key, value in data.items():
        if not key.startswith("Menu:994681330_"):
            continue
        images = value.get("images")
        image_url = ""
        if isinstance(images, list) and images:
            image_url = images[0]
        elif isinstance(images, dict):
            image_url = images.get("url") or images.get("json") or ""
            if isinstance(image_url, list):
                image_url = image_url[0] if image_url else ""

        items.append(
            {
                "id": key.split(":")[1],
                "name": value.get("name", ""),
                "price": int(str(value.get("price", "0")).replace(",", "")),
                "description": value.get("description", "") or "",
                "image": image_url,
                "recommend": bool(value.get("recommend")),
            }
        )

    items.sort(key=lambda item: int(item["id"].split("_")[1]))
    return items


def parse_from_html(raw: str) -> list[dict]:
    pattern = re.compile(
        r'<span class="lPzHi">([^<]+)</span>.*?'
        r'<div class="okI98">([^<]*)</div>.*?'
        r'<em>([\d,]+)</em>원.*?'
        r'<img src="([^"]+)"',
        re.S,
    )
    items = []
    for idx, match in enumerate(pattern.finditer(raw)):
        name, description, price, image = match.groups()
        items.append(
            {
                "id": f"994681330_{idx}",
                "name": html.unescape(name.strip()),
                "price": int(price.replace(",", "")),
                "description": html.unescape(description.strip()),
                "image": decode_image_url(image),
            }
        )
    return items


def main() -> None:
    raw = HTML_PATH.read_text(encoding="utf-8", errors="replace")
    items = parse_from_apollo(raw)
    if not items:
        items = parse_from_html(raw)

    print(json.dumps(items, ensure_ascii=False, indent=2))
    print(f"\nTotal: {len(items)} items", flush=True)


if __name__ == "__main__":
    main()
