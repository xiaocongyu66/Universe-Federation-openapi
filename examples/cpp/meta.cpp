// 读取实例公开信息。依赖 libcurl。
// g++ -std=c++17 meta.cpp -lcurl -o meta && INSTANCE=https://example.com ./meta

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
    std::string url = instance + "/api/meta";
    std::string body = R"({"detail":true})";
    std::string response;

    CURL* curl = curl_easy_init();
    if (!curl) return 1;
    struct curl_slist* headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    headers = curl_slist_append(headers, "Accept: application/json");

    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body.c_str());
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
    std::cout << response << "\n";
    return code >= 300 ? 1 : 0;
}
