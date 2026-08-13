using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Core.DTOs.ResponseDto;
using Core.DTOs.Company;
using Microsoft.EntityFrameworkCore;

namespace Service.Service
{
    public class CompanyService : Service<Company>, ICompanyService
    {
        public CompanyService(IGenericRepository<Company> repository, IUnitOfWork unitOfWork) 
            : base(repository, unitOfWork)
        {
        }

        public async Task<List<CompanyResponseDto>> GetAllCompaniesAsync()
        {
            var companies = await _repository.Where(c => true)
                .Include(c => c.Trips)
                    .ThenInclude(t => t.Reservations)
                .Include(c => c.Reviews)
                .ToListAsync();

            return companies.Select(MapToResponseDto).ToList();
        }

        public async Task<CompanyResponseDto?> GetCompanyByIdAsync(Guid id)
        {
            var company = await _repository.Where(c => c.Id == id)
                .Include(c => c.Trips)
                    .ThenInclude(t => t.Reservations)
                .Include(c => c.Reviews)
                .FirstOrDefaultAsync();

            return company == null ? null : MapToResponseDto(company);
        }

        private CompanyResponseDto MapToResponseDto(Company company)
        {
            var reviewCount = company.Reviews?.Count ?? 0;
            var avgRating = reviewCount > 0 ? company.Reviews!.Average(r => r.Rating) : 0;
            var tripCount = company.Trips?.Count ?? 0;

            // Katılımcı sayısı turların rezervasyonlarından geliyor. Önceden
            // burada sabit "10.000+ Mutlu Yolcu" yazıyordu; firma profilinde
            // gerçek olmayan bir rakam gösteriliyordu.
            var participantCount = company.Trips?
                .SelectMany(t => t.Reservations ?? new List<Reservation>())
                .Count(r => !r.IsDeleted) ?? 0;

            return new CompanyResponseDto
            {
                Id = company.Id.ToString(),
                Name = company.Name,
                Logo = company.Logo ?? string.Empty,
                Phone = string.Empty,
                Email = string.Empty,
                Website = string.Empty,
                Rating = avgRating,
                ReviewCount = reviewCount,
                About = company.About ?? string.Empty,
                // Önceden About kopyalanıyordu; FullAbout hiç okunamıyordu.
                FullAbout = company.FullAbout ?? string.Empty,
                TripsLabel = $"{tripCount} Tur",
                ParticipantsLabel = $"{participantCount} Katılımcı",
                Location = company.Location ?? string.Empty
            };
        }

        public async Task<CompanyResponseDto> CreateCompanyAsync(CreateCompanyDto dto)
        {
            var company = new Company
            {
                Name = dto.Name,
                Logo = dto.Logo,
                Location = dto.Location,
                About = dto.About,
                FullAbout = dto.FullAbout,
                IsActive = true,
                IsVerified = false
            };

            await AddAsync(company);

            return new CompanyResponseDto
            {
                Id = company.Id.ToString(),
                Name = company.Name,
                Logo = company.Logo ?? string.Empty,
                Phone = string.Empty,
                Email = string.Empty,
                Website = string.Empty,
                Rating = 0,
                ReviewCount = 0,
                About = company.About ?? string.Empty,
                FullAbout = company.FullAbout ?? string.Empty,
                TripsLabel = "0 Tur",
                ParticipantsLabel = "0 Katılımcı",
                Location = company.Location ?? string.Empty
            };
        }

        public async Task<CompanyResponseDto?> UpdateCompanyAsync(Guid id, UpdateCompanyDto dto)
        {
            var company = await _repository.Where(c => c.Id == id).FirstOrDefaultAsync();
            if (company == null) return null;

            // Yalnızca gönderilen alanlar yazılıyor. Önceden her alan koşulsuz
            // atanıyordu: panel yalnızca ad/adres/hakkında gönderdiği için
            // Logo ve FullAbout her kayıtta null'a düşüyor, firma bilgileri
            // kaydedildikçe kayboluyordu.
            if (dto.Name != null) company.Name = dto.Name;
            if (dto.Logo != null) company.Logo = dto.Logo;
            if (dto.Location != null) company.Location = dto.Location;
            if (dto.About != null) company.About = dto.About;
            if (dto.FullAbout != null) company.FullAbout = dto.FullAbout;
            company.UpdatedAt = DateTime.UtcNow;

            await UpdateAsync(company);
            return await GetCompanyByIdAsync(id);
        }

        public async Task<bool> DeleteCompanyAsync(Guid id)
        {
            var company = await _repository.Where(c => c.Id == id).FirstOrDefaultAsync();
            if (company == null) return false;

            company.IsDeleted = true;
            company.DeletedAt = DateTime.UtcNow;
            await UpdateAsync(company);
            return true;
        }
    }
}
