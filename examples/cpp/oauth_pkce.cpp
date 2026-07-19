// 生成 PKCE（需 OpenSSL）。g++ -std=c++17 oauth_pkce.cpp -lcrypto -o oauth_pkce && ./oauth_pkce

#include <openssl/evp.h>
#include <openssl/rand.h>
#include <openssl/sha.h>
#include <cstdlib>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

static std::string b64url(const unsigned char* data, size_t len) {
    static const char* tbl =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    std::string out;
    for (size_t i = 0; i < len; i += 3) {
        unsigned v = data[i] << 16;
        if (i + 1 < len) v |= data[i + 1] << 8;
        if (i + 2 < len) v |= data[i + 2];
        out.push_back(tbl[(v >> 18) & 63]);
        out.push_back(tbl[(v >> 12) & 63]);
        if (i + 1 < len) out.push_back(tbl[(v >> 6) & 63]);
        if (i + 2 < len) out.push_back(tbl[v & 63]);
    }
    return out;
}

static std::string env_or(const char* k, const char* def) {
    const char* v = std::getenv(k);
    return v && *v ? std::string(v) : std::string(def);
}

int main() {
    unsigned char raw[32];
    RAND_bytes(raw, sizeof(raw));
    std::string verifier = b64url(raw, sizeof(raw));

    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256(reinterpret_cast<const unsigned char*>(verifier.data()), verifier.size(), hash);
    std::string challenge = b64url(hash, SHA256_DIGEST_LENGTH);

    unsigned char st[16];
    RAND_bytes(st, sizeof(st));
    std::string state = b64url(st, sizeof(st));

    std::string instance = env_or("INSTANCE", "https://example.com");
    while (!instance.empty() && instance.back() == '/') instance.pop_back();
    std::string client_id = env_or("CLIENT_ID", "your-client-id");
    std::string redirect = env_or("REDIRECT_URI", "https://your-app.example/oauth/callback");
    std::string scope = env_or("SCOPE", "read:profile write:notes");

    std::cout << "{\n"
              << "  \"code_verifier\": \"" << verifier << "\",\n"
              << "  \"code_challenge\": \"" << challenge << "\",\n"
              << "  \"state\": \"" << state << "\",\n"
              << "  \"authorize_url\": \"" << instance
              << "/oauth/authorize?response_type=code&client_id=" << client_id
              << "&redirect_uri=" << redirect
              << "&scope=read:profile%20write:notes"
              << "&state=" << state
              << "&code_challenge=" << challenge
              << "&code_challenge_method=S256\"\n"
              << "}\n";
    return 0;
}
