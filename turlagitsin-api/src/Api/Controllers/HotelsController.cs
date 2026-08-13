using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.DTOs.Hotel;
using Core.Services;
using Api.Helpers;

namespace Api.Controllers
{
    [Route("api/hotels")]
    [ApiController]
    public class HotelsController : ControllerBase
    {
        private readonly IHotelService _service;

        public HotelsController(IHotelService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<List<HotelDto>>> GetAll()
        {
            // Not: Filtreleme controller katmanında yapılıyor. Kupon/otel
            // hacmi düşük olduğu için yeterli; büyürse sorguya taşınmalı.
            if (!User.IsPlatformAdmin())
            {
                var own = User.GetCompanyId();
                if (own == null) return Forbid();
                var all = await _service.GetAllHotelsAsync();
                return Ok(all.Where(x => x.CompanyId == own.Value).ToList());
            }

            return Ok(await _service.GetAllHotelsAsync());
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<HotelDto>> GetById(Guid id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();
            if (item.CompanyId.HasValue && !User.CanAccessCompany(item.CompanyId.Value)) return Forbid();
            return Ok(item);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<HotelDto>> Create([FromBody] CreateHotelDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (!User.IsPlatformAdmin())
            {
                var own = User.GetCompanyId();
                if (own == null) return Forbid();
                dto.CompanyId = own.Value;
            }

            var item = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<HotelDto>> Update(Guid id, [FromBody] UpdateHotelDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();
            if (existing.CompanyId.HasValue && !User.CanAccessCompany(existing.CompanyId.Value)) return Forbid();

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
            if (existing.CompanyId.HasValue && !User.CanAccessCompany(existing.CompanyId.Value)) return Forbid();

            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
