using everything_timeline.UseCases.Common;

namespace everything_timeline.UseCases.Events;

public class EventCreateRequest : BaseRequest
{
    public List<EventDto> Events { get; set; } = new();
}