#!/usr/bin/env python3
"""读取实例公开信息。依赖: pip install requests"""
import json
import os
import sys

import requests

INSTANCE = os.environ.get("INSTANCE", "https://example.com").rstrip("/")


def main() -> None:
    r = requests.post(
        f"{INSTANCE}/api/meta",
        json={"detail": True},
        headers={"Accept": "application/json"},
        timeout=30,
    )
    if not r.ok:
        print(r.status_code, r.text, file=sys.stderr)
        sys.exit(1)
    meta = r.json()
    print(json.dumps({
        "name": meta.get("name"),
        "version": meta.get("version"),
        "uri": meta.get("uri"),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
