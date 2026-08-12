using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.Helpers;
using Core.DTOs.Refund;
using Core.Services;

namespace Api.Controllers
{
    [Route("api/refunds")]
    [ApiController]
    public class RefundsController : ControllerBase
    {
        private readonly IRefundService _service;

        public RefundsController(IRefundService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<RefundRequestDto>> Create([FromBody] CreateRefundRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var userId = User.GetUserId();
            var item = await _service.CreateAsync(dto, userId);
            return Ok(item);
        }

        [HttpGet]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<List<RefundRequestDto>>> GetAll()
        {
            // Önceden yalnızca platform admini erişebiliyordu; panelin
            // "İptal ve İade" ekranı şirket hesaplarında 403 alıyordu.
            if (!User.IsPlatformAdmin())
            {
                var own = User.GetCompanyId();
                if (own == null) return Forbid();
                return Ok(await _service.GetByCompanyAsync(own.Value));
            }

            return Ok(await _service.GetAllRefundsAsync());
        }

        [HttpPut("{id:guid}/status")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<RefundRequestDto>> UpdateStatus(Guid id, [FromBody] UpdateRefundStatusDto dto)
        {
            if (!User.IsPlatformAdmin())
            {
                var owner = await _service.GetOwnerCompanyIdAsync(id);
                if (owner == null) return NotFound();
                if (!User.CanAccessCompany(owner.Value)) return Forbid();
            }

            if (!ModelState.IsValid) return BadRequest(ModelState);
            var item = await _service.UpdateStatusAsync(id, dto);
            if (item == null) return NotFound();
            return Ok(item);
        }
    }
}
