namespace everything_timeline.UseCases.Datasets;

public class DatasetGetResponse
{
    public IEnumerable<DatasetDto> Datasets { get; set; } = Array.Empty<DatasetDto>();
}
public class DatasetDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string CreatedBy { get; set; } = "";
    public int DomainStart { get; set; } = -3200;
    public int DomainEnd { get; set; } = new DateTime().Year;
    public DateTime? CreatedAt { get; set; }
}