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

        public ReservationsController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<List<ReservationResponseDto>>> GetAll()
        {
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

            return Ok(reservation);
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
            var cancelled = await _reservationService.CancelReservationAsync(id, reason);
            if (!cancelled)
                return NotFound();

            return NoContent();
        }
    }
}
