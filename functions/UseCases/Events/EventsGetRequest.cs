using everything_timeline.UseCases.Common;

namespace everything_timeline.UseCases.Events;

public class EventsGetRequest : BaseRequest
{
    public EventsGetRequest(Guid datasetId, Guid userId)
    {
        DatasetId = datasetId;
        UserId = userId;
    }

    public Guid DatasetId { get; set; }
}