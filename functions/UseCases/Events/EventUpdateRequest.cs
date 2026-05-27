using everything_timeline.UseCases.Common;

namespace everything_timeline.UseCases.Events;

public class EventUpdateRequest : BaseRequest
{
    public required EventDto Event { get; set; }
}