using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.Helpers;
using Core.DTOs.ResponseDto;
using Core.DTOs.Review;
using Core.Services;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        private readonly ITripService _tripService;
        private readonly ICompanyNotificationService _notifications;

        public ReviewsController(
            IReviewService reviewService,
            ITripService tripService,
            ICompanyNotificationService notifications)
        {
            _reviewService = reviewService;
            _tripService = tripService;
            _notifications = notifications;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<ReviewResponseDto>>> GetAll([FromQuery] Guid? tripId = null, [FromQuery] Guid? userId = null)
        {
            if (tripId.HasValue)
                return Ok(await _reviewService.GetReviewsByTripIdAsync(tripId.Value));

            if (userId.HasValue)
                return Ok(await _reviewService.GetReviewsByUserIdAsync(userId.Value));

            var reviews = await _reviewService.GetAllReviewsAsync();
            return Ok(reviews);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ReviewResponseDto>> GetById(Guid id)
        {
            var review = await _reviewService.GetReviewByIdAsync(id);
            if (review == null)
                return NotFound();

            return Ok(review);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ReviewResponseDto>> Create([FromBody] CreateReviewDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.GetUserId();
            var review = await _reviewService.CreateReviewAsync(dto, userId);

            // Değerlendirme yazıldığında firmanın haberi olsun.
            var trip = await _tripService.GetTripByIdAsync(dto.TripId);
            if (trip != null && Guid.TryParse(trip.CompanyId, out var companyId))
            {
                await _notifications.NotifyNewReviewAsync(companyId, trip.Title ?? "Tur", dto.Rating);
            }

            return CreatedAtAction(nameof(GetById), new { id = review.Id }, review);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = User.GetUserId();
            var deleted = await _reviewService.DeleteReviewAsync(id, userId);
            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}
