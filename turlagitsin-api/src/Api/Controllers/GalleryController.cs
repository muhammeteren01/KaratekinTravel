using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.DTOs.Gallery;
using Core.Services;

namespace Api.Controllers
{
    [Route("api/gallery")]
    [ApiController]
    public class GalleryController : ControllerBase
    {
        private readonly ITripGalleryService _service;

        public GalleryController(ITripGalleryService service)
        {
            _service = service;
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
            var item = await _service.AddAsync(dto);
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
