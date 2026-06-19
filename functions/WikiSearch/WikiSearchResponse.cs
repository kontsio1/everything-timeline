using System.Text.Json.Serialization;

namespace everything_timeline.WikiSearch;

public class WikiSearchResponse
{
    [JsonPropertyName("pages")]
    public List<WikiSearchPage> Pages { get; init; } = [];
}

public class WikiSearchPage
{
    [JsonPropertyName("id")]
    public long Id { get; init; }

    [JsonPropertyName("key")]
    public string Key { get; init; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; init; } = string.Empty;

    [JsonPropertyName("excerpt")]
    public string Excerpt { get; init; } = string.Empty;

    [JsonPropertyName("matched_title")]
    public string? MatchedTitle { get; init; }

    [JsonPropertyName("anchor")]
    public string? Anchor { get; init; }

    [JsonPropertyName("description")]
    public string? Description { get; init; }

    [JsonPropertyName("thumbnail")]
    public WikiSearchThumbnail? Thumbnail { get; init; }
}

public class WikiSearchThumbnail
{
    [JsonPropertyName("mimetype")]
    public string MimeType { get; init; } = string.Empty;

    [JsonPropertyName("width")]
    public int Width { get; init; }

    [JsonPropertyName("height")]
    public int Height { get; init; }

    [JsonPropertyName("duration")]
    public double? Duration { get; init; }

    [JsonPropertyName("url")]
    public string Url { get; init; } = string.Empty;
}

