using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.DTOs.Payment;
using Core.Services;

namespace Api.Controllers
{
    /// <summary>
    /// Ödeme kayıtları. PaymentService zaten vardı ama hiçbir uç onu dışa
    /// açmıyordu; panelin "Ödeme Bilgileri" ekranı bu yüzden sabit örnek
    /// satırlar gösteriyordu.
    /// </summary>
    [Route("api/payments")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _service;

        public PaymentsController(IPaymentService service)
        {
            _service = service;
        }

        /// <summary>status: completed | pending | failed | refunded</summary>
        [HttpGet]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<List<PaymentDto>>> GetByCompany(
            [FromQuery] Guid companyId,
            [FromQuery] string? status)
        {
            if (companyId == Guid.Empty)
                return BadRequest(new { message = "companyId zorunludur." });

            return Ok(await _service.GetByCompanyAsync(companyId, status));
        }

        [HttpGet("by-reservation/{reservationId:guid}")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<ActionResult<List<PaymentDto>>> GetByReservation(Guid reservationId)
        {
            return Ok(await _service.GetByReservationAsync(reservationId));
        }
    }
}
