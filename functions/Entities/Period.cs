using System;
using System.Collections.Generic;

namespace everything_timeline.Entities;

public partial class Period
{
    public Guid Id { get; set; }

    public Guid DatasetId { get; set; }

    public string? Name { get; set; }

    public int StartYear { get; set; }

    public int EndYear { get; set; }

    public int? Priority { get; set; }

    public virtual Dataset Dataset { get; set; } = null!;
}
