using everything_timeline.Entities;

namespace everything_timeline.UseCases.Events;

public class EventUpdateResponse(Event entity) : EventDto(entity)
{
}