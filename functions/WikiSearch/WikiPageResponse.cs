using System.Text.Json.Serialization;

namespace everything_timeline.WikiSearch;

public class WikiPageResponse
{
    [JsonPropertyName("batchcomplete")] public bool Batchcomplete { get; set; }
    [JsonPropertyName("query")] public Query Query { get; set; }
}

public class Query
{
    [JsonPropertyName("pages")] public Page[] Pages { get; set; }
}

public class Page
{
    [JsonPropertyName("pageid")] public int PageId { get; set; }
    [JsonPropertyName("title")] public string Title { get; set; } = string.Empty;
    [JsonPropertyName("extract")] public string Extract { get; set; } = string.Empty;
}