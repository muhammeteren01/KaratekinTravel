using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.DTOs.VehicleOperation;
using Core.Services;

namespace Api.Controllers
{
    /// <summary>
    /// Araç işlem geçmişi (sefer, bakım, yakıt, temizlik).
    /// Panelin "Geçmiş İşlemler" ekranını besler.
    /// </summary>
    [Route("api/vehicle-operations")]
    [ApiController]
    public class VehicleOperationsController : ControllerBase
    {
        private readonly IVehicleOperationService _service;

        public VehicleOperationsController(IVehicleOperationService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<List<VehicleOperationDto>>> GetAll(
            [FromQuery] Guid? companyId,
            [FromQuery] Guid? vehicleId,
            [FromQuery] string? operationType)
        {
            return Ok(await _service.GetAsync(companyId, vehicleId, operationType));
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<VehicleOperationDto>> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<VehicleOperationDto>> Create([FromBody] CreateVehicleOperationDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (dto.VehicleId == Guid.Empty) return BadRequest(new { message = "vehicleId zorunludur." });
            if (string.IsNullOrWhiteSpace(dto.OperationType)) return BadRequest(new { message = "operationType zorunludur." });

            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<VehicleOperationDto>> Update(Guid id, [FromBody] UpdateVehicleOperationDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
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
