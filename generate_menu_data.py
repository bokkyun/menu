import json
import re
from pathlib import Path

PLACE_ID = "994681330"
ROOT = Path(__file__).parent
HTML_PATH = ROOT / "naver-menu.html"
OUTPUT_PATH = ROOT / "menu-data.js"

CATEGORY_RULES = [
    ("피자", "피자"),
    ("파스타", "파스타"),
    ("포케", "밥·포케"),
    ("볶음밥", "밥·포케"),
    ("브런치", "브런치"),
    ("샐러드", "브런치"),
    ("후무스", "브런치"),
    ("에그인헬", "브런치"),
    ("감자", "브런치"),
    ("치아바타", "브런치"),
]


def infer_category(name: str) -> str:
    for keyword, category in CATEGORY_RULES:
        if keyword in name:
            return category
    return "기타"


def parse_apollo(raw: str) -> list[dict]:
    start = raw.find("window.__APOLLO_STATE__ = ")
    end = raw.find("window.__PLACE_STATE__")
    if start == -1:
        raise ValueError("APOLLO_STATE를 찾을 수 없습니다.")

    blob = raw[start + len("window.__APOLLO_STATE__ = ") : end].strip()
    if blob.endswith(";"):
        blob = blob[:-1]

    data = json.loads(blob)
    items = []
    for key, value in data.items():
        if not key.startswith(f"Menu:{PLACE_ID}_"):
            continue

        images = value.get("images") or []
        items.append(
            {
                "id": value.get("id", key.split(":")[1]),
                "name": value.get("name", ""),
                "price": int(str(value.get("price", "0")).replace(",", "")),
                "category": infer_category(value.get("name", "")),
                "description": (value.get("description") or "").replace("\n", " "),
                "image": images[0] if images else "",
                "index": value.get("index", 0),
            }
        )

    items.sort(key=lambda item: item["index"])
    return items


def to_js(items: list[dict]) -> str:
    menu_lines = []
    for item in items:
        menu_lines.append(
            "\n".join(
                [
                    "  {",
                    f'    id: "{item["id"]}",',
                    f'    name: "{item["name"]}",',
                    f'    price: {item["price"]},',
                    f'    category: "{item["category"]}",',
                    f'    description: "{item["description"]}",',
                    f'    image: "{item["image"]}",',
                    "  },",
                ]
            )
        )

    return (
        "const RESTAURANT = {\n"
        '  name: "스미스가 좋아하는 테라스",\n'
        '  location: "서울 종로구 삼청동",\n'
        f'  placeId: "{PLACE_ID}",\n'
        f'  source: "https://m.place.naver.com/restaurant/{PLACE_ID}/menu/list",\n'
        "};\n\n"
        "const MENU_ITEMS = [\n"
        + "\n".join(menu_lines)
        + "\n];\n"
    )


def main() -> None:
    raw = HTML_PATH.read_text(encoding="utf-8", errors="replace")
    items = parse_apollo(raw)
    if not items:
        raise ValueError("메뉴 항목을 찾지 못했습니다.")

    OUTPUT_PATH.write_text(to_js(items), encoding="utf-8")
    print(f"Generated {len(items)} menu items -> {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
