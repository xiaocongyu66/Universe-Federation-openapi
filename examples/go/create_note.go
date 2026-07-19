// Bearer 发帖。
// 运行: INSTANCE=https://example.com TOKEN=xxx go run create_note.go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

func main() {
	instance := env("INSTANCE", "https://example.com")
	token := os.Getenv("TOKEN")
	if token == "" {
		fatal(fmt.Errorf("请设置 TOKEN"))
	}
	text := env("TEXT", "Hello from an open app (Go)")
	payload, _ := json.Marshal(map[string]string{"text": text})

	req, err := http.NewRequest(http.MethodPost, instance+"/api/notes/create", bytes.NewReader(payload))
	if err != nil {
		fatal(err)
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fatal(err)
	}
	defer resp.Body.Close()
	data, _ := io.ReadAll(resp.Body)
	fmt.Println(resp.StatusCode, string(data))
	if resp.StatusCode >= 300 {
		os.Exit(1)
	}
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

func fatal(err error) {
	fmt.Fprintln(os.Stderr, err)
	os.Exit(1)
}
