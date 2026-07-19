// 生成 PKCE 与授权 URL。
// 运行: go run oauth_pkce.go
package main

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/url"
	"os"
)

func main() {
	verifier := b64url(randBytes(32))
	sum := sha256.Sum256([]byte(verifier))
	challenge := b64url(sum[:])
	state := b64url(randBytes(16))

	instance := env("INSTANCE", "https://example.com")
	clientID := env("CLIENT_ID", "your-client-id")
	redirect := env("REDIRECT_URI", "https://your-app.example/oauth/callback")
	scope := env("SCOPE", "read:profile write:notes")

	q := url.Values{}
	q.Set("response_type", "code")
	q.Set("client_id", clientID)
	q.Set("redirect_uri", redirect)
	q.Set("scope", scope)
	q.Set("state", state)
	q.Set("code_challenge", challenge)
	q.Set("code_challenge_method", "S256")

	out, _ := json.MarshalIndent(map[string]string{
		"code_verifier":  verifier,
		"code_challenge": challenge,
		"state":          state,
		"authorize_url":  instance + "/oauth/authorize?" + q.Encode(),
	}, "", "  ")
	fmt.Println(string(out))
}

func randBytes(n int) []byte {
	b := make([]byte, n)
	_, _ = rand.Read(b)
	return b
}

func b64url(b []byte) string {
	return base64.RawURLEncoding.EncodeToString(b)
}

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return trimSlash(v)
	}
	return trimSlash(def)
}

func trimSlash(s string) string {
	for len(s) > 0 && s[len(s)-1] == '/' {
		s = s[:len(s)-1]
	}
	return s
}
