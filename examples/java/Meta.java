// 读取实例公开信息。
// 编译运行: javac Meta.java && INSTANCE=https://example.com java Meta
// 需要 Java 11+

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class Meta {
    public static void main(String[] args) throws Exception {
        String instance = env("INSTANCE", "https://example.com").replaceAll("/+$", "");
        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build();
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(instance + "/api/meta"))
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("{\"detail\":true}"))
                .build();
        HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
        if (res.statusCode() >= 300) {
            System.err.println(res.statusCode() + " " + res.body());
            System.exit(1);
        }
        System.out.println(res.body());
    }

    static String env(String k, String def) {
        String v = System.getenv(k);
        return v == null || v.isEmpty() ? def : v;
    }
}
