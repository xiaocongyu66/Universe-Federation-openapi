#!/usr/bin/env python3
"""生成 PKCE 并输出授权 URL。"""
import base64
import hashlib
import json
import os
import secrets
from urllib.parse import urlencode


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def main() -> None:
    verifier = b64url(secrets.token_bytes(32))
    challenge = b64url(hashlib.sha256(verifier.encode("ascii")).digest())
    state = b64url(secrets.token_bytes(16))

    instance = os.environ.get("INSTANCE", "https://example.com").rstrip("/")
    client_id = os.environ.get("CLIENT_ID", "your-client-id")
    redirect_uri = os.environ.get(
        "REDIRECT_URI", "https://your-app.example/oauth/callback"
    )
    scope = os.environ.get("SCOPE", "read:profile write:notes")

    q = urlencode(
        {
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "scope": scope,
            "state": state,
            "code_challenge": challenge,
            "code_challenge_method": "S256",
        }
    )
    print(
        json.dumps(
            {
                "code_verifier": verifier,
                "code_challenge": challenge,
                "state": state,
                "authorize_url": f"{instance}/oauth/authorize?{q}",
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
