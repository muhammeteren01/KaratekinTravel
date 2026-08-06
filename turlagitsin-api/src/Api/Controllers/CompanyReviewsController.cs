using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.Helpers;
using Core.DTOs.Review;
using Core.Services;

namespace Api.Controllers
{
    [Route("api/company-reviews")]
    [ApiController]
    public class CompanyReviewsController : ControllerBase
    {
        private readonly ICompanyReviewService _service;

        public CompanyReviewsController(ICompanyReviewService service)
        {
            _service = service;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<CompanyReviewDto>>> GetByCompanyId([FromQuery] Guid companyId)
        {
            return Ok(await _service.GetByCompanyIdAsync(companyId));
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<CompanyReviewDto>> Create([FromBody] CreateCompanyReviewDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var userId = User.GetUserId();
            var item = await _service.CreateAsync(dto, userId);
            return Ok(item);
        }
    }
}
