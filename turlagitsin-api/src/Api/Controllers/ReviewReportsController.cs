using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Api.Helpers;
using Core.Entities;
using Core.Repositories;
using Core.UnitOfWork;

namespace Api.Controllers
{
    [Route("api/review-reports")]
    [ApiController]
    public class ReviewReportsController : ControllerBase
    {
        private readonly IReviewReportRepository _repository;
        private readonly IUnitOfWork _unitOfWork;

        public ReviewReportsController(IReviewReportRepository repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<IActionResult> GetAll([FromQuery] string? status = null)
        {
            var query = _repository.Where(r => true).Include(r => r.Review).AsQueryable();
            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(r => r.Status == status);

            var items = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
            return Ok(items.Select(Map));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateReviewReportRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var report = new ReviewReport
            {
                ReviewId = request.ReviewId,
                ReportedByUserId = User.GetUserId(),
                Category = request.Category,
                Details = request.Details,
                Status = "pending"
            };

            await _repository.AddAsync(report);
            await _unitOfWork.SaveChangesAsync();
            return Ok(Map(report));
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateReviewReportStatusRequest request)
        {
            var report = await _repository.Where(r => r.Id == id).FirstOrDefaultAsync();
            if (report == null)
                return NotFound();

            report.Status = request.Status;
            report.UpdatedAt = DateTime.UtcNow;
            _repository.Update(report);
            await _unitOfWork.SaveChangesAsync();
            return Ok(Map(report));
        }

        private static object Map(ReviewReport r) => new
        {
            id = r.Id,
            reviewId = r.ReviewId,
            reportedByUserId = r.ReportedByUserId,
            category = r.Category,
            details = r.Details,
            status = r.Status,
            createdAt = r.CreatedAt
        };
    }

    public class CreateReviewReportRequest
    {
        public Guid ReviewId { get; set; }
        public required string Category { get; set; }
        public string? Details { get; set; }
    }

    public class UpdateReviewReportStatusRequest
    {
        public required string Status { get; set; }
    }
}
