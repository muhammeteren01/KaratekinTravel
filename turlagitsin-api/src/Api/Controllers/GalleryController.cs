using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.DTOs.Gallery;
using Core.Services;
using Api.Helpers;

namespace Api.Controllers
{
    [Route("api/gallery")]
    [ApiController]
    public class GalleryController : ControllerBase
    {
        private readonly ITripGalleryService _service;
        private readonly ITripService _tripService;

        public GalleryController(ITripGalleryService service, ITripService tripService)
        {
            _service = service;
            _tripService = tripService;
        }

        /// <summary>Görselin bağlı olduğu tur çağıranın şirketinde mi?</summary>
        private async Task<bool> CanTouchTrip(Guid tripId)
        {
            if (User.IsPlatformAdmin()) return true;

            var owner = await _tripService.GetOwnerCompanyIdAsync(tripId);
            return owner.HasValue && User.CanAccessCompany(owner.Value);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<GalleryImageDto>>> GetByTripId([FromQuery] Guid tripId)
        {
            return Ok(await _service.GetByTripIdAsync(tripId));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<GalleryImageDto>> Upload([FromBody] UploadImageDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (!await CanTouchTrip(dto.TripId)) return Forbid();

            var item = await _service.AddAsync(dto);
            return Ok(item);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var tripId = await _service.GetTripIdAsync(id);
            if (tripId == null) return NotFound();
            if (!await CanTouchTrip(tripId.Value)) return Forbid();

            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
