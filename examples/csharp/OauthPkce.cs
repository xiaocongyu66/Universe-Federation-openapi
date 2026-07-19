// 生成 PKCE 与授权 URL。.NET 6+

using System.Security.Cryptography;
using System.Text;
using System.Web;

var verifier = Base64Url(RandomNumberGenerator.GetBytes(32));
var challenge = Base64Url(SHA256.HashData(Encoding.ASCII.GetBytes(verifier)));
var state = Base64Url(RandomNumberGenerator.GetBytes(16));

var instance = (Environment.GetEnvironmentVariable("INSTANCE") ?? "https://example.com").TrimEnd('/');
var clientId = Environment.GetEnvironmentVariable("CLIENT_ID") ?? "your-client-id";
var redirect = Environment.GetEnvironmentVariable("REDIRECT_URI") ?? "https://your-app.example/oauth/callback";
var scope = Environment.GetEnvironmentVariable("SCOPE") ?? "read:profile write:notes";

var qs = new StringBuilder();
qs.Append("response_type=code");
qs.Append("&client_id=").Append(Uri.EscapeDataString(clientId));
qs.Append("&redirect_uri=").Append(Uri.EscapeDataString(redirect));
qs.Append("&scope=").Append(Uri.EscapeDataString(scope));
qs.Append("&state=").Append(Uri.EscapeDataString(state));
qs.Append("&code_challenge=").Append(Uri.EscapeDataString(challenge));
qs.Append("&code_challenge_method=S256");

Console.WriteLine($$"""
{
  "code_verifier": "{{verifier}}",
  "code_challenge": "{{challenge}}",
  "state": "{{state}}",
  "authorize_url": "{{instance}}/oauth/authorize?{{qs}}"
}
""");

static string Base64Url(byte[] data) =>
    Convert.ToBase64String(data).TrimEnd('=').Replace('+', '-').Replace('/', '_');
