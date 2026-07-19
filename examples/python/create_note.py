#!/usr/bin/env python3
"""Bearer 发帖。依赖: pip install requests"""
import os
import sys

import requests

INSTANCE = os.environ.get("INSTANCE", "https://example.com").rstrip("/")
TOKEN = os.environ.get("TOKEN")
TEXT = os.environ.get("TEXT", "Hello from an open app (Python)")


def main() -> None:
    if not TOKEN:
        print("请设置环境变量 TOKEN", file=sys.stderr)
        sys.exit(1)

    r = requests.post(
        f"{INSTANCE}/api/notes/create",
        json={"text": TEXT},
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Accept": "application/json",
        },
        timeout=30,
    )
    print(r.status_code, r.text)
    if not r.ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
