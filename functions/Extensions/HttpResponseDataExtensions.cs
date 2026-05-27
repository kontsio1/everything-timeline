using System.Net;
using Microsoft.Azure.Functions.Worker.Http;

namespace everything_timeline.Extensions
{
    public static class HttpResponseDataExtensions
    {
        public static void SetCorsHeaders(this HttpResponseData response)
        {
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, x-requested-with");
        }

        public static void SetJsonContentType(this HttpResponseData response)
        {
            response.Headers.Add("Content-Type", "application/json");
        }

        public static async Task<HttpResponseData> OkJsonAsync<T>(this HttpResponseData response, T value)
        {
            response.StatusCode = HttpStatusCode.OK;
            await response.WriteStringAsync(System.Text.Json.JsonSerializer.Serialize(value));
            return response;
        }

        public static async Task<HttpResponseData> CreatedJsonAsync<T>(this HttpResponseData response, T value)
        {
            response.StatusCode = HttpStatusCode.Created;
            await response.WriteStringAsync(System.Text.Json.JsonSerializer.Serialize(value));
            return response;
        }

        public static async Task<HttpResponseData> BadRequestAsync(this HttpResponseData response, string message)
        {
            response.StatusCode = HttpStatusCode.BadRequest;
            await response.WriteStringAsync(message);
            return response;
        }

        public static async Task<HttpResponseData> InternalServerErrorAsync(this HttpResponseData response, string message)
        {
            response.StatusCode = HttpStatusCode.InternalServerError;
            await response.WriteStringAsync(message);
            return response;
        }
    }
}

