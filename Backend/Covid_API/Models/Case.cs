using System;
using System.Collections.Generic;

namespace Covid_API.Models;

public partial class Case
{
    public int RegionId { get; set; }

    public DateOnly RecordedDate { get; set; }

    public long? ConfirmedCases { get; set; }

    public long? RecoveredCases { get; set; }

    public long? DeathCases { get; set; }

    public int Id { get; set; }

    public virtual Region Region { get; set; } = null!;
}
