# C 示例（libcurl / OpenSSL）

```bash
cc meta.c -lcurl -o meta && INSTANCE=https://example.com ./meta
cc create_note.c -lcurl -o create_note
INSTANCE=https://example.com TOKEN=xxx ./create_note
cc oauth_pkce.c -lcrypto -o oauth_pkce && ./oauth_pkce
```
