using System;
using System.Collections.Generic;

namespace everything_timeline.Entities;

public partial class Event
{
    public Guid Id { get; set; }
    
    public string? Name { get; set; }

    public string? Info { get; set; }

    public int? Date { get; set; }

    public Guid DatasetId { get; set; }
    
    public virtual Dataset Dataset { get; set; } = null!;
}
