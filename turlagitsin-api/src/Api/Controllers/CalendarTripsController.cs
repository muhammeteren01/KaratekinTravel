using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.Helpers;
using Core.DTOs.CalendarTrip;
using Core.Services;

namespace Api.Controllers
{
    [Route("api/calendar-trips")]
    [ApiController]
    public class CalendarTripsController : ControllerBase
    {
        private readonly ICalendarTripService _service;

        public CalendarTripsController(ICalendarTripService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<CalendarTripDto>>> Get([FromQuery] Guid? userId = null)
        {
            return Ok(await _service.GetAsync(userId));
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<CalendarTripDto>> Create([FromBody] CreateCalendarTripDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var currentUserId = User.TryGetUserId(out var uid) ? uid : (Guid?)null;
            var item = await _service.CreateAsync(dto, currentUserId);
            return Ok(item);
        }
    }
}
