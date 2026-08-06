using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.DTOs.TripDeparture;
using Core.Services;

namespace Api.Controllers
{
    [Route("api/trip-departures")]
    [ApiController]
    public class TripDeparturesController : ControllerBase
    {
        private readonly ITripDepartureService _service;

        public TripDeparturesController(ITripDepartureService service)
        {
            _service = service;
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
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var item = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<TripDepartureDto>> Update(Guid id, [FromBody] UpdateTripDepartureDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var item = await _service.UpdateAsync(id, dto);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
