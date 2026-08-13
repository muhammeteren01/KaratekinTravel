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
        private readonly IReservationService _reservationService;
        private readonly ITripService _tripService;
        private readonly ICompanyNotificationService _notifications;

        public RefundsController(
            IRefundService service,
            IReservationService reservationService,
            ITripService tripService,
            ICompanyNotificationService notifications)
        {
            _service = service;
            _reservationService = reservationService;
            _tripService = tripService;
            _notifications = notifications;
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<RefundRequestDto>> Create([FromBody] CreateRefundRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var userId = User.GetUserId();
            var item = await _service.CreateAsync(dto, userId);

            // İade talebi açıldığında turun şirketine bildirim düşür.
            var reservation = await _reservationService.GetReservationByIdAsync(item.ReservationId);
            if (reservation != null && Guid.TryParse(reservation.CompanyId, out var companyId))
            {
                var trip = await _tripService.GetTripByIdAsync(Guid.Parse(reservation.TripId));
                await _notifications.NotifyRefundRequestedAsync(
                    companyId, trip?.Title ?? "Tur", item.Amount, item.Currency);
            }

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
