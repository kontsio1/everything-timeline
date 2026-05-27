using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace everything_timeline.Extensions
{
    public static class HttpRequestDataExtensions
    {
        public static Guid GetUserId(this HttpRequestData req)
        {
            var user = req.FunctionContext.GetHttpContext()?.User;
            if (user?.Identity?.IsAuthenticated != true)
                return Guid.Empty;

            var id = user.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;
            return Guid.TryParse(id, out var guid) ? guid : Guid.Empty;
        }

        public static async Task<T?> DeserializeBodyAsync<T>(this HttpRequestData req,
            System.Text.Json.JsonSerializerOptions? options = null)
        {
            var body = await new StreamReader(req.Body).ReadToEndAsync();
            if (string.IsNullOrEmpty(body))
                return default;

            return options is null
                ? System.Text.Json.JsonSerializer.Deserialize<T>(body)
                : System.Text.Json.JsonSerializer.Deserialize<T>(body, options);
        }

        public static async Task<(T? value, bool isEmpty)> ReadBodyAsync<T>(this HttpRequestData req,
            System.Text.Json.JsonSerializerOptions? options = null)
        {
            var body = await new StreamReader(req.Body).ReadToEndAsync();
            if (string.IsNullOrEmpty(body))
                return (default, true);

            var value = options is null
                ? System.Text.Json.JsonSerializer.Deserialize<T>(body)
                : System.Text.Json.JsonSerializer.Deserialize<T>(body, options);

            return (value, false);
        }
    }
}



