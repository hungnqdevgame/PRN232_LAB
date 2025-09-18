using Covid_API.Models;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;

public class RegionsController : ODataController
{
    private readonly PRN232Context _dbContext;

    public RegionsController(PRN232Context context)
    {
        _dbContext = context;
    }

    [EnableQuery(PageSize = 100, MaxTop = 250)]
    public IQueryable<Region> Get()
    {
        return _dbContext.Regions;
    }
}
