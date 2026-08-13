using Api.Helpers;
using Core.DTOs.Company;
using Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    /// <summary>
    /// Banka / tahsilat bilgisi değişiklik talepleri.
    ///
    /// Firma bilgileri doğrudan düzenlenemiyor; değişiklik ancak admin
    /// onayından geçen bir talebe bağlı olarak uygulanıyor.
    /// </summary>
    [Route("api/bank-change-requests")]
    [ApiController]
    public class BankChangeRequestsController : ControllerBase
    {
        private readonly IBankChangeRequestService _service;

        public BankChangeRequestsController(IBankChangeRequestService service)
        {
            _service = service;
        }

        /// <summary>Firmanın yürürlükteki banka bilgileri (maskeli).</summary>
        [HttpGet("current")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<CompanyBankInfoDto>> GetCurrent([FromQuery] Guid? companyId)
        {
            var target = ResolveCompanyId(companyId);
            if (target == null) return Forbid();

            var info = await _service.GetCompanyBankInfoAsync(target.Value);
            if (info == null) return NotFound();

            return Ok(info);
        }

        [HttpGet]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<List<BankChangeRequestDto>>> GetAll(
            [FromQuery] Guid? companyId,
            [FromQuery] string? status)
        {
            // CompanyAdmin başka şirketin taleplerini listeleyemez.
            if (!User.IsPlatformAdmin())
            {
                var own = User.GetCompanyId();
                if (own == null) return Forbid();
                companyId = own.Value;
            }

            return Ok(await _service.GetAsync(companyId, status));
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<BankChangeRequestDto>> GetById(Guid id)
        {
            var request = await _service.GetByIdAsync(id);
            if (request == null) return NotFound();
            if (!User.CanAccessCompany(request.CompanyId)) return Forbid();

            return Ok(request);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<BankChangeRequestDto>> Create([FromBody] CreateBankChangeRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var target = ResolveCompanyId(null);
            if (target == null) return Forbid();

            var pending = await _service.GetAsync(target.Value, "pending");
            if (pending.Count > 0)
                return Conflict(new { message = "Bekleyen bir değişiklik talebiniz zaten var." });

            try
            {
                User.TryGetUserId(out var requesterId);
                var created = await _service.CreateAsync(target.Value, requesterId, dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>Talebi onayla ya da reddet. Yalnızca platform admini.</summary>
        [HttpPut("{id:guid}/review")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<BankChangeRequestDto>> Review(Guid id, [FromBody] ReviewBankChangeRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                User.TryGetUserId(out var reviewerId);
                var reviewed = await _service.ReviewAsync(id, reviewerId, dto);
                if (reviewed == null) return NotFound();
                return Ok(reviewed);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>CompanyAdmin daima kendi şirketine bağlanır.</summary>
        private Guid? ResolveCompanyId(Guid? requested)
        {
            if (!User.IsPlatformAdmin()) return User.GetCompanyId();
            return requested ?? User.GetCompanyId();
        }
    }
}
