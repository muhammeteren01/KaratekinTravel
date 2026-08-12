using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.DTOs.TripDeparture;
using Core.Services;
using Api.Helpers;

namespace Api.Controllers
{
    [Route("api/trip-departures")]
    [ApiController]
    public class TripDeparturesController : ControllerBase
    {
        private readonly ITripDepartureService _service;
        private readonly ITripService _tripService;

        public TripDeparturesController(ITripDepartureService service, ITripService tripService)
        {
            _service = service;
            _tripService = tripService;
        }

        /// <summary>Alt tarihin bağlı olduğu tur çağıranın şirketinde mi?</summary>
        private async Task<bool> CanTouchTrip(Guid tripId)
        {
            if (User.IsPlatformAdmin()) return true;

            var owner = await _tripService.GetOwnerCompanyIdAsync(tripId);
            return owner.HasValue && User.CanAccessCompany(owner.Value);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<TripDepartureDto>>> GetByTripId([FromQuery] Guid tripId)
        {
            var items = await _service.GetByTripIdAsync(tripId);
            return Ok(items);
        }

        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<ActionResult<TripDepartureDto>> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<TripDepartureDto>> Create([FromBody] CreateTripDepartureDto dto)
        {
            if (!await CanTouchTrip(dto.TripId)) return Forbid();

            if (!ModelState.IsValid) return BadRequest(ModelState);
            var item = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<TripDepartureDto>> Update(Guid id, [FromBody] UpdateTripDepartureDto dto)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();
            if (!await CanTouchTrip(existing.TripId)) return Forbid();

            if (!ModelState.IsValid) return BadRequest(ModelState);
            var item = await _service.UpdateAsync(id, dto);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();
            if (!await CanTouchTrip(existing.TripId)) return Forbid();

            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
