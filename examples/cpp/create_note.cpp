// Bearer 发帖。g++ -std=c++17 create_note.cpp -lcurl -o create_note
// INSTANCE=https://example.com TOKEN=xxx ./create_note

#include <curl/curl.h>
#include <cstdlib>
#include <iostream>
#include <string>

static size_t write_cb(char* ptr, size_t size, size_t nmemb, void* userdata) {
    auto* out = static_cast<std::string*>(userdata);
    out->append(ptr, size * nmemb);
    return size * nmemb;
}

static std::string env_or(const char* k, const char* def) {
    const char* v = std::getenv(k);
    return v && *v ? std::string(v) : std::string(def);
}

int main() {
    std::string instance = env_or("INSTANCE", "https://example.com");
    while (!instance.empty() && instance.back() == '/') instance.pop_back();
    const char* token = std::getenv("TOKEN");
    if (!token || !*token) {
        std::cerr << "请设置 TOKEN\n";
        return 1;
    }
    std::string text = env_or("TEXT", "Hello from an open app (C++)");
    std::string json = std::string("{\"text\":\"") + text + "\"}";
    std::string url = instance + "/api/notes/create";
    std::string response;
    std::string auth = std::string("Authorization: Bearer ") + token;

    CURL* curl = curl_easy_init();
    struct curl_slist* headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    headers = curl_slist_append(headers, "Accept: application/json");
    headers = curl_slist_append(headers, auth.c_str());

    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_cb);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    CURLcode rc = curl_easy_perform(curl);
    long code = 0;
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &code);
    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);

    if (rc != CURLE_OK) {
        std::cerr << curl_easy_strerror(rc) << "\n";
        return 1;
    }
    std::cout << code << " " << response << "\n";
    return code >= 300 ? 1 : 0;
}
