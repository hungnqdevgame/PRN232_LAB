using Covid_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;

namespace Covid_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LabController : ODataController
    {
        private PRN232Context _dbContext { get; }

        public LabController(PRN232Context context)
        {
            _dbContext = context;
        }

        [HttpGet("countries")]
        [EnableQuery(PageSize = 100, MaxTop = 250)]
        public IQueryable<Region> Get()
        {
            return _dbContext.Regions;
        }

        [HttpGet("cases")]
        [EnableQuery(PageSize = 100, MaxTop = 250)]
        public IQueryable<Case> GetCases()
        {
            return _dbContext.Cases;
        }
    }
}
