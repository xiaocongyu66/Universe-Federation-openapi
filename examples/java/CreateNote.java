// Bearer 发帖。Java 11+
// INSTANCE=https://example.com TOKEN=xxx java CreateNote

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class CreateNote {
    public static void main(String[] args) throws Exception {
        String instance = env("INSTANCE", "https://example.com").replaceAll("/+$", "");
        String token = System.getenv("TOKEN");
        if (token == null || token.isEmpty()) {
            System.err.println("请设置 TOKEN");
            System.exit(1);
        }
        String text = env("TEXT", "Hello from an open app (Java)");
        String json = "{\"text\":\"" + text.replace("\"", "\\\"") + "\"}";

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(instance + "/api/notes/create"))
                .timeout(Duration.ofSeconds(30))
                .header("Authorization", "Bearer " + token)
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
        HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
        System.out.println(res.statusCode() + " " + res.body());
        if (res.statusCode() >= 300) System.exit(1);
    }

    static String env(String k, String def) {
        String v = System.getenv(k);
        return v == null || v.isEmpty() ? def : v;
    }
}
