using System.Net;
using Microsoft.Azure.Functions.Worker.Http;
using everything_timeline.UseCases.Common;

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
            await response.WriteStringAsync(System.Text.Json.JsonSerializer.Serialize(Result.Ok(value)));
            return response;
        }

        public static async Task<HttpResponseData> CreatedJsonAsync<T>(this HttpResponseData response, T value)
        {
            response.StatusCode = HttpStatusCode.OK;
            await response.WriteStringAsync(System.Text.Json.JsonSerializer.Serialize(Result.Ok(value)));
            return response;
        }

        public static async Task<HttpResponseData> Failure(this HttpResponseData response, HttpStatusCode statusCode, string errorMessage)
        {
            response.StatusCode = statusCode;
            await response.WriteStringAsync(System.Text.Json.JsonSerializer.Serialize(Result.Failure(new Problem(statusCode, errorMessage))));
            return response;
        }
    }
}
