using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.DTOs.ResponseDto;
using Core.DTOs.Trip;
using Core.DTOs.TripSeatch;
using Core.Services;
using Api.Helpers;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TripsController : ControllerBase
    {
        private readonly ITripService _tripService;

        public TripsController(ITripService tripService)
        {
            _tripService = tripService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<TripResponseDto>>> GetAll()
        {
            var trips = await _tripService.GetAllTripsAsync();
            return Ok(trips);
        }

        /// <summary>
        /// Panel listesi: çağıranın şirketine ait turlar, taslaklar dahil.
        /// Herkese açık GET /api/trips yalnızca yayındakileri döndürür.
        /// </summary>
        [HttpGet("manage")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<List<TripResponseDto>>> GetManaged()
        {
            // Platform admini için companyId null → tüm şirketler.
            var companyId = User.IsPlatformAdmin() ? null : User.GetCompanyId();

            if (!User.IsPlatformAdmin() && companyId == null)
                return Forbid();

            return Ok(await _tripService.GetManagedTripsAsync(companyId));
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<ActionResult<PagedResultDto<TripResponseDto>>> Search([FromQuery] TripSearchDto search)
        {
            var result = await _tripService.SearchTripsAsync(search);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<TripResponseDto>> GetById(Guid id)
        {
            var trip = await _tripService.GetTripByIdAsync(id);
            if (trip == null)
                return NotFound();

            return Ok(trip);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<TripResponseDto>> Create([FromBody] CreateTripDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // CompanyAdmin başka şirket adına tur açamaz; gövdedeki değer
            // ne olursa olsun kendi şirketine sabitlenir.
            if (!User.IsPlatformAdmin())
            {
                var own = User.GetCompanyId();
                if (own == null) return Forbid();
                dto.CompanyId = own.Value;
            }

            var trip = await _tripService.CreateTripAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = trip.Id }, trip);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<TripResponseDto>> Update(Guid id, [FromBody] UpdateTripDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var owner = await _tripService.GetOwnerCompanyIdAsync(id);
            if (owner == null) return NotFound();
            if (!User.CanAccessCompany(owner.Value)) return Forbid();

            var trip = await _tripService.UpdateTripAsync(id, dto);
            if (trip == null)
                return NotFound();

            return Ok(trip);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var owner = await _tripService.GetOwnerCompanyIdAsync(id);
            if (owner == null) return NotFound();
            if (!User.CanAccessCompany(owner.Value)) return Forbid();

            var deleted = await _tripService.DeleteTripAsync(id);
            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}
