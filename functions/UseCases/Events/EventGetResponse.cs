using everything_timeline.Entities;

namespace everything_timeline.UseCases.Events;

public class EventGetResponse
{
    public List<EventDto> Events { get; set; } = new();
}

public class EventDto(Event entity)
{
    public Guid? Id { get; set; } = entity.Id;
    public int Date { get; set; } = entity.Date;
    public string Name { get; set; } = entity.Name;
    public string Info { get; set; } = entity.Info;
    public Guid DatasetId { get; set; } = entity.DatasetId;
}