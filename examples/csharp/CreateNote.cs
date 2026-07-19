// Bearer 发帖。.NET 6+
// INSTANCE=https://example.com TOKEN=xxx dotnet script CreateNote.cs

using System.Net.Http.Headers;
using System.Text;

var instance = (Environment.GetEnvironmentVariable("INSTANCE") ?? "https://example.com").TrimEnd('/');
var token = Environment.GetEnvironmentVariable("TOKEN");
if (string.IsNullOrEmpty(token))
{
    Console.Error.WriteLine("请设置 TOKEN");
    Environment.Exit(1);
}
var text = Environment.GetEnvironmentVariable("TEXT") ?? "Hello from an open app (C#)";
var json = $"{{\"text\":{JsonEscape(text)}}}";

using var http = new HttpClient();
http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
using var content = new StringContent(json, Encoding.UTF8, "application/json");
using var res = await http.PostAsync($"{instance}/api/notes/create", content);
var body = await res.Content.ReadAsStringAsync();
Console.WriteLine($"{(int)res.StatusCode} {body}");
if (!res.IsSuccessStatusCode) Environment.Exit(1);

static string JsonEscape(string s) =>
    "\"" + s.Replace("\\", "\\\\").Replace("\"", "\\\"") + "\"";
