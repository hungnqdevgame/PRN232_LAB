using Covid_API.Models;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;

public class CasesController : ODataController
{
    private readonly PRN232Context _dbContext;

    public CasesController(PRN232Context context)
    {
        _dbContext = context;
    }

    [EnableQuery(PageSize = 100, MaxTop = 250)]
    public IQueryable<Case> Get()
    {
        return _dbContext.Cases;
    }
}


