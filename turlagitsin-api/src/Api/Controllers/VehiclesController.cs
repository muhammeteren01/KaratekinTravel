using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.DTOs.Vehicle;
using Core.Services;

namespace Api.Controllers
{
    [Route("api/vehicles")]
    [ApiController]
    public class VehiclesController : ControllerBase
    {
        private readonly IVehicleService _service;

        public VehiclesController(IVehicleService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<List<VehicleDto>>> GetAll([FromQuery] Guid? companyId)
        {
            if (companyId.HasValue)
                return Ok(await _service.GetByCompanyIdAsync(companyId.Value));

            return Ok(await _service.GetAllVehiclesAsync());
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<VehicleDto>> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<VehicleDto>> Create([FromBody] CreateVehicleDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var item = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<VehicleDto>> Update(Guid id, [FromBody] UpdateVehicleDto dto)
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

        [HttpGet("layouts")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<List<SeatLayoutDto>>> GetLayouts([FromQuery] Guid companyId)
        {
            var layouts = await _service.GetLayoutsByCompanyAsync(companyId);
            return Ok(layouts);
        }

        [HttpPost("layouts")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<SeatLayoutDto>> CreateLayout([FromBody] CreateSeatLayoutDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var layout = await _service.CreateLayoutAsync(dto);
            return Ok(layout);
        }
    }
}
