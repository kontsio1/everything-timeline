using System.ComponentModel.DataAnnotations;

namespace everything_timeline;

public class Event
{
    public Guid Id { get; set; }
    [Required] 
    public Guid DatasetId { get; set; }
    [Required] 
    public string Name { get; set; }
    public string? Info { get; set; }
    [Required] 
    public int Date { get; set; }
}

public class Dataset
{
    [Required] 
    public Guid Id { get; set; }
    [Required] 
    public string Name { get; set; }
    public string CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    [Required] 
    public int Value { get; set; }
}

public class Period
{
    public Guid Id { get; set; }
    [Required] 
    public Guid DatasetId { get; set; }
    [Required] 
    public string Name { get; set; }
    [Required] 
    public int StartYear { get; set; }
    [Required] 
    public int EndYear { get; set; }
    public int Priority { get; set; }
}