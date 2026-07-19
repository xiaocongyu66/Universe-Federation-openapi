// 读取实例公开信息。
// 运行: INSTANCE=https://example.com go run meta.go
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
	body := []byte(`{"detail":true}`)
	resp, err := http.Post(instance+"/api/meta", "application/json", bytes.NewReader(body))
	if err != nil {
		fatal(err)
	}
	defer resp.Body.Close()
	data, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 300 {
		fatal(fmt.Errorf("%s %s", resp.Status, data))
	}
	var meta map[string]any
	_ = json.Unmarshal(data, &meta)
	out, _ := json.MarshalIndent(map[string]any{
		"name":    meta["name"],
		"version": meta["version"],
		"uri":     meta["uri"],
	}, "", "  ")
	fmt.Println(string(out))
}

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return stringsTrimRightSlash(v)
	}
	return stringsTrimRightSlash(def)
}

func stringsTrimRightSlash(s string) string {
	for len(s) > 0 && s[len(s)-1] == '/' {
		s = s[:len(s)-1]
	}
	return s
}

func fatal(err error) {
	fmt.Fprintln(os.Stderr, err)
	os.Exit(1)
}
