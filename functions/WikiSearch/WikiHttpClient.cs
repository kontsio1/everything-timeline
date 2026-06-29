using System.Net.Http.Json;
using System.Net.Http.Headers;

namespace everything_timeline.WikiSearch;

public class WikiHttpClient(HttpClient client) : IWikiHttpClient
{
    private const string WikiRestBaseUrl = "https://en.wikipedia.org/w/rest.php/";
    private const string WikiApiBaseUrl = "https://en.wikipedia.org/w/api.php";
    private const string ApiUserAgentHeaderName = "User-Agent";
    private const string ApiUserAgentHeaderValue = "EverythingTimelineProject/1.0 kontsio18@gmail.com";

    public async Task<WikiSearchResponse> SearchTitlesAsync(string query, CancellationToken cancellationToken = default)
    {
        EnsureRequiredText(query, nameof(query));

        var endpoint = $"{WikiRestBaseUrl}v1/search/title?q={Uri.EscapeDataString(query)}&limit=5";
        return await GetAsync<WikiSearchResponse>(endpoint, cancellationToken);
    }

    public async Task<WikiPageResponse> GetPageExtractAsync(string title, CancellationToken cancellationToken = default)
    {
        EnsureRequiredText(title, nameof(title));

        var formattedTitle = title.Replace(" ", "%20");
        var endpoint = $"{WikiApiBaseUrl}?format=json&action=query&titles={formattedTitle}&prop=extracts&explaintext=true&formatversion=2";
        return await GetAsync<WikiPageResponse>(endpoint, cancellationToken);
    }

    private async Task<TResponse> GetAsync<TResponse>(string requestUrl, CancellationToken cancellationToken)
        where TResponse : new()
    {
        using var request = CreateGetRequest(requestUrl);
        using var response = await client.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        var resp = await response.Content.ReadFromJsonAsync<TResponse>(cancellationToken: cancellationToken);
        return resp ?? new TResponse();
    }

    private static HttpRequestMessage CreateGetRequest(string requestUrl)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        request.Headers.TryAddWithoutValidation(ApiUserAgentHeaderName, ApiUserAgentHeaderValue);
        return request;
    }

    private static void EnsureRequiredText(string value, string parameterName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException("Value cannot be empty.", parameterName);
        }
    }
}