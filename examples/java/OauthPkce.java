// 生成 PKCE 与授权 URL。Java 11+
// java OauthPkce

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

public class OauthPkce {
    public static void main(String[] args) throws Exception {
        String verifier = b64url(random(32));
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        String challenge = b64url(md.digest(verifier.getBytes(StandardCharsets.US_ASCII)));
        String state = b64url(random(16));

        String instance = env("INSTANCE", "https://example.com").replaceAll("/+$", "");
        String clientId = env("CLIENT_ID", "your-client-id");
        String redirect = env("REDIRECT_URI", "https://your-app.example/oauth/callback");
        String scope = env("SCOPE", "read:profile write:notes");

        String url = instance + "/oauth/authorize"
                + "?response_type=code"
                + "&client_id=" + enc(clientId)
                + "&redirect_uri=" + enc(redirect)
                + "&scope=" + enc(scope)
                + "&state=" + enc(state)
                + "&code_challenge=" + enc(challenge)
                + "&code_challenge_method=S256";

        System.out.println("{");
        System.out.println("  \"code_verifier\": \"" + verifier + "\",");
        System.out.println("  \"code_challenge\": \"" + challenge + "\",");
        System.out.println("  \"state\": \"" + state + "\",");
        System.out.println("  \"authorize_url\": \"" + url + "\"");
        System.out.println("}");
    }

    static byte[] random(int n) {
        byte[] b = new byte[n];
        new SecureRandom().nextBytes(b);
        return b;
    }

    static String b64url(byte[] b) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }

    static String enc(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    static String env(String k, String def) {
        String v = System.getenv(k);
        return v == null || v.isEmpty() ? def : v;
    }
}
