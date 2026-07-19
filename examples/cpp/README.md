# C++ 示例（libcurl / OpenSSL）

```bash
g++ -std=c++17 meta.cpp -lcurl -o meta && INSTANCE=https://example.com ./meta
g++ -std=c++17 create_note.cpp -lcurl -o create_note
INSTANCE=https://example.com TOKEN=xxx ./create_note
g++ -std=c++17 oauth_pkce.cpp -lcrypto -o oauth_pkce && ./oauth_pkce
```
