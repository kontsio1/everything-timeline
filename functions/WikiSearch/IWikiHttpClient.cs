namespace everything_timeline.WikiSearch;

public interface IWikiHttpClient
{
    Task<WikiSearchResponse> SearchTitlesAsync(string query, CancellationToken cancellationToken);
    Task<WikiPageResponse> GetPageExtractAsync(string title, CancellationToken cancellationToken);
}