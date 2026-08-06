using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.DTOs.Report;
using Core.Services;

namespace Api.Controllers
{
    [Route("api/reports")]
    [ApiController]
    [Authorize(Roles = "Admin,CompanyAdmin")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _service;

        public ReportsController(IReportService service)
        {
            _service = service;
        }

        [HttpGet("trips")]
        public async Task<ActionResult<TripReportDto>> GetTripReport(
            [FromQuery] DateTime start,
            [FromQuery] DateTime end)
        {
            return Ok(await _service.GetTripReportAsync(start, end));
        }

        [HttpGet("companies")]
        public async Task<ActionResult<CompanyReportDto>> GetCompanyReport(
            [FromQuery] DateTime? start = null,
            [FromQuery] DateTime? end = null)
        {
            return Ok(await _service.GetCompanyReportAsync(start, end));
        }

        [HttpGet("finance")]
        public async Task<ActionResult<FinanceReportDto>> GetFinanceReport(
            [FromQuery] DateTime start,
            [FromQuery] DateTime end,
            [FromQuery] Guid? companyId = null)
        {
            return Ok(await _service.GetFinanceReportAsync(companyId, start, end));
        }

        [HttpGet("user-activity")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<UserActivityDto>>> GetUserActivity()
        {
            return Ok(await _service.GetUserActivityAsync());
        }
    }
}
