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
        private readonly PRN232Context dbContext;

        public LabController()
        {
            dbContext = new PRN232Context();
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<Region> Get()
        {
            return dbContext.Regions.ToList().AsQueryable();
        }

        [HttpGet("cases")]
        [EnableQuery]
        public IQueryable<Case> GetCases(DateOnly date)
        {
            return dbContext.Cases.Where(data => data.RecordedDate == date).AsQueryable<Case>();
        }
    }
}
