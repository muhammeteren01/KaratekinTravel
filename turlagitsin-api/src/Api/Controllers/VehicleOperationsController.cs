using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.DTOs.VehicleOperation;
using Core.Services;
using Api.Helpers;

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
        private readonly IVehicleService _vehicleService;

        public VehicleOperationsController(IVehicleOperationService service, IVehicleService vehicleService)
        {
            _service = service;
            _vehicleService = vehicleService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<List<VehicleOperationDto>>> GetAll(
            [FromQuery] Guid? companyId,
            [FromQuery] Guid? vehicleId,
            [FromQuery] string? operationType)
        {
            // CompanyAdmin sorguda başka şirket veremez.
            if (!User.IsPlatformAdmin())
            {
                var own = User.GetCompanyId();
                if (own == null) return Forbid();
                companyId = own.Value;
            }

            return Ok(await _service.GetAsync(companyId, vehicleId, operationType));
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<VehicleOperationDto>> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();
            if (!await CanTouchVehicle(item.VehicleId)) return Forbid();
            return Ok(item);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<VehicleOperationDto>> Create([FromBody] CreateVehicleOperationDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (dto.VehicleId == Guid.Empty) return BadRequest(new { message = "vehicleId zorunludur." });
            if (string.IsNullOrWhiteSpace(dto.OperationType)) return BadRequest(new { message = "operationType zorunludur." });
            if (!await CanTouchVehicle(dto.VehicleId)) return Forbid();

            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<VehicleOperationDto>> Update(Guid id, [FromBody] UpdateVehicleOperationDto dto)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();
            if (!await CanTouchVehicle(existing.VehicleId)) return Forbid();

            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();
            if (!await CanTouchVehicle(existing.VehicleId)) return Forbid();

            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        /// <summary>İşlem kaydının bağlı olduğu araç çağıranın şirketinde mi?</summary>
        private async Task<bool> CanTouchVehicle(Guid vehicleId)
        {
            if (User.IsPlatformAdmin()) return true;

            var vehicle = await _vehicleService.GetByIdAsync(vehicleId);
            return vehicle != null && User.CanAccessCompany(vehicle.CompanyId);
        }
    }
}
