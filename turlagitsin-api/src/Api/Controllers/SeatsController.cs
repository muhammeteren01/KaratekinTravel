using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.DTOs.SeatSelection;
using Core.Services;

namespace Api.Controllers
{
    [Route("api/seats")]
    [ApiController]
    public class SeatsController : ControllerBase
    {
        private readonly ISeatAvailabilityService _service;

        public SeatsController(ISeatAvailabilityService service)
        {
            _service = service;
        }

        [HttpGet("availability")]
        [AllowAnonymous]
        public async Task<ActionResult<SoldSeatsResponseDto>> GetAvailability(
            [FromQuery] Guid? departureId = null,
            [FromQuery] Guid? tripId = null)
        {
            if (departureId.HasValue)
                return Ok(await _service.GetSoldSeatsForDepartureAsync(departureId.Value));

            if (tripId.HasValue)
                return Ok(await _service.GetSoldSeatsForTripAsync(tripId.Value));

            return BadRequest("Provide departureId or tripId");
        }
    }
}
