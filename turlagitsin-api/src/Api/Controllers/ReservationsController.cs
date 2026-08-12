using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.Helpers;
using Core.DTOs.Reservation;
using Core.DTOs.ResponseDto;
using Core.Services;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationsController : ControllerBase
    {
        private readonly IReservationService _reservationService;
        private readonly ITripService _tripService;

        public ReservationsController(IReservationService reservationService, ITripService tripService)
        {
            _reservationService = reservationService;
            _tripService = tripService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<List<ReservationResponseDto>>> GetAll()
        {
            if (!User.IsPlatformAdmin())
            {
                var own = User.GetCompanyId();
                if (own == null) return Forbid();

                var all = await _reservationService.GetAllReservationsAsync();
                return Ok(all.Where(r => r.CompanyId == own.Value.ToString()).ToList());
            }

            var reservations = await _reservationService.GetAllReservationsAsync();
            return Ok(reservations);
        }

        [HttpGet("my")]
        [Authorize]
        public async Task<ActionResult<List<ReservationResponseDto>>> GetMyReservations()
        {
            var userId = User.GetUserId();
            var reservations = await _reservationService.GetReservationsByUserIdAsync(userId);
            return Ok(reservations);
        }

        [HttpGet("by-trip/{tripId}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<List<ReservationResponseDto>>> GetByTrip(Guid tripId)
        {
            if (!User.IsPlatformAdmin())
            {
                var owner = await _tripService.GetOwnerCompanyIdAsync(tripId);
                if (owner == null) return NotFound();
                if (!User.CanAccessCompany(owner.Value)) return Forbid();
            }

            var reservations = await _reservationService.GetReservationsByTripIdAsync(tripId);
            return Ok(reservations);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<ReservationResponseDto>> GetById(Guid id)
        {
            var reservation = await _reservationService.GetReservationByIdAsync(id);
            if (reservation == null)
                return NotFound();

            // Rezervasyon müşteri adı, koltuk ve tutar içeriyor. Yalnızca
            // rezervasyonu yapan kullanıcı, turun şirketi ve platform admini
            // görebilmeli; önceden oturum açan herkese açıktı.
            if (!CanSeeReservation(reservation)) return Forbid();

            return Ok(reservation);
        }

        private bool CanSeeReservation(ReservationResponseDto reservation)
        {
            if (User.IsPlatformAdmin()) return true;

            if (User.TryGetUserId(out var userId) &&
                string.Equals(reservation.UserId, userId.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            return Guid.TryParse(reservation.CompanyId, out var companyId) && User.CanAccessCompany(companyId);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ReservationResponseDto>> Create([FromBody] CreateReservationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.GetUserId();
            var reservation = await _reservationService.CreateReservationAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = reservation.Id }, reservation);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<ReservationResponseDto>> UpdateStatus(Guid id, [FromBody] UpdateReservationStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existing = await _reservationService.GetReservationByIdAsync(id);
            if (existing == null) return NotFound();
            if (!User.IsPlatformAdmin())
            {
                if (!Guid.TryParse(existing.CompanyId, out var companyId) || !User.CanAccessCompany(companyId))
                    return Forbid();
            }

            var reservation = await _reservationService.UpdateReservationStatusAsync(id, dto);
            if (reservation == null)
                return NotFound();

            return Ok(reservation);
        }

        [HttpPost("payment")]
        [Authorize]
        public async Task<ActionResult<ReservationResponseDto>> ProcessPayment([FromBody] ProcessPaymentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var reservation = await _reservationService.ProcessPaymentAsync(dto);
            if (reservation == null)
                return NotFound();

            return Ok(reservation);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Cancel(Guid id, [FromQuery] string reason = "User cancelled")
        {
            var existing = await _reservationService.GetReservationByIdAsync(id);
            if (existing == null) return NotFound();

            // Yalnızca rezervasyonu yapan kullanıcı veya turun şirketi iptal edebilir.
            if (!CanSeeReservation(existing)) return Forbid();

            var cancelled = await _reservationService.CancelReservationAsync(id, reason);
            if (!cancelled)
                return NotFound();

            return NoContent();
        }
    }
}
