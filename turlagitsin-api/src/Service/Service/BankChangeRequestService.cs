using Core.DTOs.Company;
using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace Service.Service
{
    public class BankChangeRequestService : Service<BankChangeRequest>, IBankChangeRequestService
    {
        private readonly IGenericRepository<Company> _companyRepository;

        public BankChangeRequestService(
            IGenericRepository<BankChangeRequest> repository,
            IGenericRepository<Company> companyRepository,
            IUnitOfWork unitOfWork)
            : base(repository, unitOfWork)
        {
            _companyRepository = companyRepository;
        }

        public async Task<List<BankChangeRequestDto>> GetAsync(Guid? companyId, string? status)
        {
            var query = _repository.Where(r => true);

            if (companyId.HasValue)
                query = query.Where(r => r.CompanyId == companyId.Value);

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(r => r.Status == status);

            var rows = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
            return rows.Select(MapToDto).ToList();
        }

        public async Task<BankChangeRequestDto?> GetByIdAsync(Guid id)
        {
            var row = await _repository.Where(r => r.Id == id).FirstOrDefaultAsync();
            return row == null ? null : MapToDto(row);
        }

        public async Task<CompanyBankInfoDto?> GetCompanyBankInfoAsync(Guid companyId)
        {
            var company = await _companyRepository.Where(c => c.Id == companyId).FirstOrDefaultAsync();
            if (company == null) return null;

            var hasPending = await _repository
                .Where(r => r.CompanyId == companyId && r.Status == "pending")
                .AnyAsync();

            return new CompanyBankInfoDto
            {
                BankName = company.BankName,
                AccountHolder = company.BankAccountHolder,
                IbanMasked = MaskIban(company.Iban),
                TaxOffice = company.TaxOffice,
                TaxNumberMasked = MaskTaxNumber(company.TaxNumber),
                BillingAddress = company.BillingAddress,
                HasPendingRequest = hasPending,
            };
        }

        public async Task<BankChangeRequestDto> CreateAsync(Guid companyId, Guid? userId, CreateBankChangeRequestDto dto)
        {
            var iban = CompactIban(dto.Iban);

            if (!IsValidTurkishIban(iban))
                throw new InvalidOperationException("IBAN geçersiz: TR'den sonra 24 hane olmalı ve kontrol hanesi tutmalıdır.");

            var entity = new BankChangeRequest
            {
                CompanyId = companyId,
                RequestedByUserId = userId,
                BankName = dto.BankName.Trim(),
                AccountHolder = dto.AccountHolder.Trim(),
                Iban = iban,
                TaxOffice = dto.TaxOffice?.Trim(),
                TaxNumber = dto.TaxNumber?.Trim(),
                BillingAddress = dto.BillingAddress?.Trim(),
                Reason = dto.Reason?.Trim(),
                IbanDocument = dto.IbanDocument,
                AuthorizationDocument = dto.AuthorizationDocument,
                TaxCertificate = dto.TaxCertificate,
                Status = "pending",
            };

            await AddAsync(entity);
            return MapToDto(entity);
        }

        public async Task<BankChangeRequestDto?> ReviewAsync(Guid id, Guid? reviewerId, ReviewBankChangeRequestDto dto)
        {
            var status = (dto.Status ?? string.Empty).Trim().ToLowerInvariant();
            if (status != "approved" && status != "rejected")
                throw new InvalidOperationException("Durum yalnızca 'approved' ya da 'rejected' olabilir.");

            var request = await _repository.Where(r => r.Id == id).FirstOrDefaultAsync();
            if (request == null) return null;

            if (request.Status != "pending")
                throw new InvalidOperationException("Bu talep zaten sonuçlandırılmış.");

            request.Status = status;
            request.ReviewNote = dto.ReviewNote?.Trim();
            request.ReviewedAt = DateTime.UtcNow;
            request.ReviewedByUserId = reviewerId;
            request.UpdatedAt = DateTime.UtcNow;

            // Onaylandığında firmanın yürürlükteki bilgileri talepten yazılır;
            // bilgiler ancak bu yolla değişebiliyor.
            if (status == "approved")
            {
                var company = await _companyRepository.Where(c => c.Id == request.CompanyId).FirstOrDefaultAsync();
                if (company != null)
                {
                    company.BankName = request.BankName;
                    company.BankAccountHolder = request.AccountHolder;
                    company.Iban = request.Iban;
                    company.TaxOffice = request.TaxOffice;
                    company.TaxNumber = request.TaxNumber;
                    company.BillingAddress = request.BillingAddress;
                    company.UpdatedAt = DateTime.UtcNow;
                    _companyRepository.Update(company);
                }
            }

            _repository.Update(request);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(request);
        }

        private static BankChangeRequestDto MapToDto(BankChangeRequest r) => new()
        {
            Id = r.Id,
            CompanyId = r.CompanyId,
            BankName = r.BankName,
            AccountHolder = r.AccountHolder,
            Iban = MaskIban(r.Iban) ?? string.Empty,
            TaxOffice = r.TaxOffice,
            TaxNumber = MaskTaxNumber(r.TaxNumber),
            BillingAddress = r.BillingAddress,
            Reason = r.Reason,
            Status = r.Status,
            ReviewNote = r.ReviewNote,
            ReviewedAt = r.ReviewedAt,
            CreatedAt = r.CreatedAt,
            HasIbanDocument = !string.IsNullOrEmpty(r.IbanDocument),
            HasAuthorizationDocument = !string.IsNullOrEmpty(r.AuthorizationDocument),
            HasTaxCertificate = !string.IsNullOrEmpty(r.TaxCertificate),
        };

        private static string CompactIban(string? value) =>
            (value ?? string.Empty).Replace(" ", string.Empty).ToUpperInvariant();

        /// <summary>ISO 13616 mod-97 kontrolü. TR IBAN: TR + 24 hane.</summary>
        private static bool IsValidTurkishIban(string compact)
        {
            if (compact.Length != 26 || !compact.StartsWith("TR")) return false;
            if (!compact.Skip(2).All(char.IsDigit)) return false;

            var rearranged = compact[4..] + compact[..4];
            var remainder = 0;

            foreach (var ch in rearranged)
            {
                // Harfler A=10 ... Z=35 karşılığıyla iki haneye açılıyor.
                if (char.IsLetter(ch))
                {
                    var mapped = ch - 'A' + 10;
                    remainder = (remainder * 100 + mapped) % 97;
                }
                else
                {
                    remainder = (remainder * 10 + (ch - '0')) % 97;
                }
            }

            return remainder == 1;
        }

        /// <summary>TR12 **** **** **** **** 3456</summary>
        private static string? MaskIban(string? iban)
        {
            if (string.IsNullOrWhiteSpace(iban)) return null;
            var compact = CompactIban(iban);
            if (compact.Length < 8) return compact;

            var head = compact[..4];
            var tail = compact[^4..];
            var middle = new string('*', compact.Length - 8);
            var masked = head + middle + tail;

            return string.Join(' ', Enumerable.Range(0, (masked.Length + 3) / 4)
                .Select(i => masked.Substring(i * 4, Math.Min(4, masked.Length - i * 4))));
        }

        /// <summary>124******125</summary>
        private static string? MaskTaxNumber(string? taxNumber)
        {
            if (string.IsNullOrWhiteSpace(taxNumber)) return null;
            var digits = new string(taxNumber.Where(char.IsDigit).ToArray());
            if (digits.Length <= 6) return digits;

            return digits[..3] + new string('*', digits.Length - 6) + digits[^3..];
        }
    }
}
