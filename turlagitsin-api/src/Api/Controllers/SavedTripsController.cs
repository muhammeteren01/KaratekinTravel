using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.Helpers;
using Core.Services;

namespace Api.Controllers
{
    [Route("api/saved-trips")]
    [ApiController]
    [Authorize]
    public class SavedTripsController : ControllerBase
    {
        private readonly IUserSavedTripService _service;

        public SavedTripsController(IUserSavedTripService service)
        {
            _service = service;
        }

        [HttpGet("my")]
        public async Task<ActionResult<List<Guid>>> GetMy()
        {
            var userId = User.GetUserId();
            return Ok(await _service.GetSavedTripIdsAsync(userId));
        }

        [HttpPost("{tripId:guid}")]
        public async Task<IActionResult> Save(Guid tripId)
        {
            var userId = User.GetUserId();
            await _service.SaveAsync(userId, tripId);
            return Ok();
        }

        [HttpDelete("{tripId:guid}")]
        public async Task<IActionResult> Unsave(Guid tripId)
        {
            var userId = User.GetUserId();
            var removed = await _service.UnsaveAsync(userId, tripId);
            if (!removed) return NotFound();
            return NoContent();
        }
    }
}
