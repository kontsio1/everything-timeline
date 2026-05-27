namespace everything_timeline.UseCases.Common;

public class BaseRequest
{
    public Guid UserId { get; set; }

    public void SetUser(Guid userId)
    {
        UserId = userId;
    }
    public bool IsAuthenticated()
    {
        return UserId != Guid.Empty;
    }
}