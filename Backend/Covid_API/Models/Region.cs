using System;
using System.Collections.Generic;

namespace Covid_API.Models;

public partial class Region
{
    public string Name { get; set; } = null!;

    public int Id { get; set; }

    public virtual ICollection<Case> Cases { get; set; } = new List<Case>();
}
