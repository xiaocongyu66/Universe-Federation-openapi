/* 生成 PKCE。cc oauth_pkce.c -lcrypto -o oauth_pkce && ./oauth_pkce */
#include <openssl/rand.h>
#include <openssl/sha.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void b64url(const unsigned char *in, size_t inlen, char *out, size_t outcap) {
    static const char *tbl =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    size_t o = 0;
    for (size_t i = 0; i < inlen && o + 4 < outcap; i += 3) {
        unsigned v = in[i] << 16;
        if (i + 1 < inlen) v |= in[i + 1] << 8;
        if (i + 2 < inlen) v |= in[i + 2];
        out[o++] = tbl[(v >> 18) & 63];
        out[o++] = tbl[(v >> 12) & 63];
        if (i + 1 < inlen) out[o++] = tbl[(v >> 6) & 63];
        if (i + 2 < inlen) out[o++] = tbl[v & 63];
    }
    out[o] = '\0';
}

int main(void) {
    unsigned char raw[32], hash[SHA256_DIGEST_LENGTH], st[16];
    char verifier[64], challenge[64], state[48];
    RAND_bytes(raw, sizeof(raw));
    b64url(raw, sizeof(raw), verifier, sizeof(verifier));
    SHA256((unsigned char *)verifier, strlen(verifier), hash);
    b64url(hash, sizeof(hash), challenge, sizeof(challenge));
    RAND_bytes(st, sizeof(st));
    b64url(st, sizeof(st), state, sizeof(state));

    const char *instance = getenv("INSTANCE");
    if (!instance || !instance[0]) instance = "https://example.com";
    const char *client_id = getenv("CLIENT_ID");
    if (!client_id) client_id = "your-client-id";

    printf("{\n");
    printf("  \"code_verifier\": \"%s\",\n", verifier);
    printf("  \"code_challenge\": \"%s\",\n", challenge);
    printf("  \"state\": \"%s\",\n", state);
    printf("  \"authorize_url\": \"%s/oauth/authorize?response_type=code&client_id=%s"
           "&redirect_uri=https://your-app.example/oauth/callback"
           "&scope=read:profile%%20write:notes&state=%s"
           "&code_challenge=%s&code_challenge_method=S256\"\n",
           instance, client_id, state, challenge);
    printf("}\n");
    return 0;
}
