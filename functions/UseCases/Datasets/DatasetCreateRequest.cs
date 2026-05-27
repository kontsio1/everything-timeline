using System.Text.Json.Serialization;
using everything_timeline.UseCases.Common;
using Microsoft.Build.Framework;

namespace everything_timeline.UseCases.Datasets;

public class DatasetCreateRequest : BaseRequest
{
    [Required]
    [JsonPropertyName("name")]
    public string Name { get; set; }
    [JsonPropertyName("description")]
    public string? Description { get; set; }
}