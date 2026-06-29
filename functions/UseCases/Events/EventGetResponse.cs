using System.Text.Json.Serialization;
using everything_timeline.Entities;

namespace everything_timeline.UseCases.Events;

public class EventGetResponse
{
    public List<EventDto> Events { get; set; } = new();
}

public class EventDto
{
    public Guid? Id { get; set; }
    public int Date { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? WikiPageTitle { get; set; }
    public string Info { get; set; } = string.Empty;
    public Guid DatasetId { get; set; }

    [JsonConstructor]
    public EventDto() { }

    public EventDto(Event entity)
    {
        Id = entity.Id;
        Date = entity.Date;
        Name = entity.Name;
        Info = entity.Info;
        DatasetId = entity.DatasetId;
    }
}