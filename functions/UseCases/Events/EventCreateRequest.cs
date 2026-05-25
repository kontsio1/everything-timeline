namespace everything_timeline.UseCases.Events;

public class EventCreateRequest
{
    public List<EventDto> Events { get; set; } = new();
}