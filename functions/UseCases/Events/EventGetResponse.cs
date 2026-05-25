namespace everything_timeline.UseCases.Events;

public class EventGetResponse
{
    public List<EventDto> Events { get; set; } = new();
}

public class EventDto
{
    public Guid? Id { get; set; }
    public int Date { get; set; }
    public string Name { get; set; }
    public string Info { get; set; }
    public Guid DatasetId { get; set; }
}