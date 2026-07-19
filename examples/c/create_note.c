/* Bearer 发帖。cc create_note.c -lcurl -o create_note
 * INSTANCE=https://example.com TOKEN=xxx ./create_note
 */
#include <curl/curl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct buf {
    char *data;
    size_t len;
};

static size_t write_cb(char *ptr, size_t size, size_t nmemb, void *userdata) {
    size_t n = size * nmemb;
    struct buf *b = userdata;
    char *p = realloc(b->data, b->len + n + 1);
    if (!p) return 0;
    b->data = p;
    memcpy(b->data + b->len, ptr, n);
    b->len += n;
    b->data[b->len] = '\0';
    return n;
}

static const char *env_or(const char *k, const char *def) {
    const char *v = getenv(k);
    return (v && v[0]) ? v : def;
}

int main(void) {
    const char *instance = env_or("INSTANCE", "https://example.com");
    const char *token = getenv("TOKEN");
    if (!token || !token[0]) {
        fprintf(stderr, "请设置 TOKEN\n");
        return 1;
    }
    const char *text = env_or("TEXT", "Hello from an open app (C)");
    char url[1024], auth[1024], json[2048];
    snprintf(url, sizeof(url), "%s/api/notes/create", instance);
    snprintf(auth, sizeof(auth), "Authorization: Bearer %s", token);
    snprintf(json, sizeof(json), "{\"text\":\"%s\"}", text);

    struct buf b = {0};
    CURL *curl = curl_easy_init();
    struct curl_slist *headers = NULL;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    headers = curl_slist_append(headers, "Accept: application/json");
    headers = curl_slist_append(headers, auth);
    curl_easy_setopt(curl, CURLOPT_URL, url);
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_cb);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &b);
    CURLcode rc = curl_easy_perform(curl);
    long code = 0;
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &code);
    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);
    if (rc != CURLE_OK) {
        fprintf(stderr, "%s\n", curl_easy_strerror(rc));
        free(b.data);
        return 1;
    }
    printf("%ld %s\n", code, b.data ? b.data : "");
    free(b.data);
    return code >= 300 ? 1 : 0;
}
