using System.Text.Json.Serialization;
using Microsoft.Build.Framework;

namespace everything_timeline.UseCases;

public class DatasetCreateRequest
{
    [Required]
    [JsonPropertyName("name")]
    public string Name { get; set; }
    [JsonPropertyName("description")]
    public string? Description { get; set; }
}