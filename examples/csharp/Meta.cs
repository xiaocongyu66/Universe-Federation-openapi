// 读取实例公开信息。
// 运行: INSTANCE=https://example.com dotnet script Meta.cs
// 或: 放入 Console 项目后 dotnet run
// 需要: .NET 6+

using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

var instance = (Environment.GetEnvironmentVariable("INSTANCE") ?? "https://example.com").TrimEnd('/');
using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
using var content = new StringContent("{\"detail\":true}", Encoding.UTF8, "application/json");
using var res = await http.PostAsync($"{instance}/api/meta", content);
var body = await res.Content.ReadAsStringAsync();
if (!res.IsSuccessStatusCode)
{
    Console.Error.WriteLine($"{(int)res.StatusCode} {body}");
    Environment.Exit(1);
}
Console.WriteLine(body);
