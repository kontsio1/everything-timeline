using everything_timeline.UseCases.Common;

namespace everything_timeline.UseCases.Events;

public class EventDeleteRequest: BaseRequest
{
    public EventDto Event { get; set; }
}