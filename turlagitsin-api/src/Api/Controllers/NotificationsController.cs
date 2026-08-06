using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.Helpers;
using Core.DTOs.Notification;
using Core.Services;

namespace Api.Controllers
{
    [Route("api/notifications")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly IUserNotificationService _service;

        public NotificationsController(IUserNotificationService service)
        {
            _service = service;
        }

        [HttpGet("my")]
        [Authorize]
        public async Task<ActionResult<List<NotificationDto>>> GetMy()
        {
            var userId = User.GetUserId();
            return Ok(await _service.GetByUserIdAsync(userId));
        }

        [HttpPut("{id:guid}/read")]
        [Authorize]
        public async Task<ActionResult<NotificationDto>> MarkRead(Guid id)
        {
            var userId = User.GetUserId();
            var item = await _service.MarkReadAsync(id, userId);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPut("{id:guid}/archive")]
        [Authorize]
        public async Task<ActionResult<NotificationDto>> Archive(Guid id)
        {
            var userId = User.GetUserId();
            var item = await _service.ArchiveAsync(id, userId);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpDelete("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = User.GetUserId();
            var deleted = await _service.DeleteAsync(id, userId);
            if (!deleted) return NotFound();
            return NoContent();
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<NotificationDto>> Create([FromBody] CreateNotificationDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var item = await _service.CreateAsync(dto);
            return Ok(item);
        }
    }
}
