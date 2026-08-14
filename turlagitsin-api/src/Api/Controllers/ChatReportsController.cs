using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Api.Helpers;
using Core.Entities;
using Core.Repositories;
using Core.UnitOfWork;

namespace Api.Controllers
{
    /// <summary>
    /// Kullanıcının bir firma sohbetini şikayet etmesi.
    ///
    /// Uygulamadaki "Sohbeti Bildir" penceresinin "Bildir" düğmesi boştu:
    /// yazılan sebep hiçbir yere gitmiyordu.
    /// </summary>
    [Route("api/chat-reports")]
    [ApiController]
    public class ChatReportsController : ControllerBase
    {
        private readonly IGenericRepository<ChatReport> _repository;
        private readonly IGenericRepository<ChatGroup> _chatGroups;
        private readonly IUnitOfWork _unitOfWork;

        public ChatReportsController(
            IGenericRepository<ChatReport> repository,
            IGenericRepository<ChatGroup> chatGroups,
            IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _chatGroups = chatGroups;
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// Panel listesi. Platform admini hepsini, firma yöneticisi yalnızca
        /// kendi firmasına ait şikayetleri görüyor.
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<IActionResult> GetAll([FromQuery] string? status = null)
        {
            var query = _repository.Where(r => true);

            if (!User.IsPlatformAdmin())
            {
                var own = User.GetCompanyId();
                if (own == null) return Forbid();
                query = query.Where(r => r.CompanyId == own.Value);
            }

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(r => r.Status == status);

            var reports = await query
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(reports.Select(Map).ToList());
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateChatReportRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Sohbetin gerçekten var olduğunu doğrula; aksi halde yabancı
            // anahtar hatası ham veritabanı istisnası olarak dönerdi.
            //
            // Firma doğrudan sohbette tutulmuyor; ChatGroup bir tura bağlı ve
            // firma turdan geliyor. Şikayeti panelde firmaya göre filtreleyebilmek
            // için burada çözülüyor.
            var group = await _chatGroups.Where(g => g.Id == request.ChatGroupId)
                .Select(g => new { g.Id, CompanyId = (Guid?)g.Trip.CompanyId })
                .FirstOrDefaultAsync();

            if (group == null)
                return NotFound(new { message = "Sohbet bulunamadı." });

            var report = new ChatReport
            {
                ChatGroupId = group.Id,
                CompanyId = group.CompanyId,
                ReportedByUserId = User.GetUserId(),
                Reason = request.Reason.Trim(),
                Status = "pending"
            };

            await _repository.AddAsync(report);
            await _unitOfWork.SaveChangesAsync();

            return Ok(Map(report));
        }

        [HttpPut("{id:guid}/status")]
        [Authorize(Roles = "Admin,CompanyAdmin")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateChatReportStatusRequest request)
        {
            var report = await _repository.Where(r => r.Id == id).FirstOrDefaultAsync();
            if (report == null) return NotFound();

            if (!User.IsPlatformAdmin())
            {
                var own = User.GetCompanyId();
                if (own == null || report.CompanyId != own) return Forbid();
            }

            report.Status = request.Status;
            report.ResolutionNote = request.ResolutionNote;
            report.ReviewedAt = DateTime.UtcNow;
            report.ReviewedByUserId = User.GetUserId();

            _repository.Update(report);
            await _unitOfWork.SaveChangesAsync();

            return Ok(Map(report));
        }

        private static object Map(ChatReport r) => new
        {
            id = r.Id,
            chatGroupId = r.ChatGroupId,
            companyId = r.CompanyId,
            reportedByUserId = r.ReportedByUserId,
            reason = r.Reason,
            status = r.Status,
            resolutionNote = r.ResolutionNote,
            reviewedAt = r.ReviewedAt,
            createdAt = r.CreatedAt
        };
    }

    public class CreateChatReportRequest
    {
        [Required]
        public Guid ChatGroupId { get; set; }

        [Required]
        [MinLength(3)]
        [MaxLength(2000)]
        public string Reason { get; set; } = string.Empty;
    }

    public class UpdateChatReportStatusRequest
    {
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? ResolutionNote { get; set; }
    }
}
