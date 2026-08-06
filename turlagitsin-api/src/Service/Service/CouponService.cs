using Core.DTOs.Coupon;
using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace Service.Service
{
    public class CouponService : Service<Coupon>, ICouponService
    {
        public CouponService(IGenericRepository<Coupon> repository, IUnitOfWork unitOfWork)
            : base(repository, unitOfWork)
        {
        }

        public async Task<List<CouponDto>> GetAllCouponsAsync()
        {
            var items = await _repository.Where(c => true).OrderByDescending(c => c.CreatedAt).ToListAsync();
            return items.Select(MapToDto).ToList();
        }

        public async Task<CouponDto?> GetByIdAsync(Guid id)
        {
            var item = await _repository.Where(c => c.Id == id).FirstOrDefaultAsync();
            return item == null ? null : MapToDto(item);
        }

        public async Task<CouponDto> CreateAsync(CreateCouponDto dto)
        {
            var normalizedCode = dto.Code.Trim().ToUpperInvariant();
            var existing = await _repository.Where(c => c.Code.ToUpper() == normalizedCode).AnyAsync();
            if (existing)
                throw new Exception("Coupon code already exists");

            var entity = new Coupon
            {
                Code = normalizedCode,
                CompanyId = dto.CompanyId,
                Type = dto.Type,
                Value = dto.Value,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                MaxUsage = dto.MaxUsage,
                IsActive = dto.IsActive,
                UsedCount = 0
            };

            await AddAsync(entity);
            return MapToDto(entity);
        }

        public async Task<CouponDto?> UpdateAsync(Guid id, UpdateCouponDto dto)
        {
            var entity = await _repository.Where(c => c.Id == id).FirstOrDefaultAsync();
            if (entity == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.Code)) entity.Code = dto.Code.Trim().ToUpperInvariant();
            if (dto.CompanyId.HasValue) entity.CompanyId = dto.CompanyId;
            if (!string.IsNullOrWhiteSpace(dto.Type)) entity.Type = dto.Type;
            if (dto.Value.HasValue) entity.Value = dto.Value.Value;
            if (dto.StartDate.HasValue) entity.StartDate = dto.StartDate.Value;
            if (dto.EndDate.HasValue) entity.EndDate = dto.EndDate.Value;
            if (dto.MaxUsage.HasValue) entity.MaxUsage = dto.MaxUsage;
            if (dto.IsActive.HasValue) entity.IsActive = dto.IsActive.Value;
            entity.UpdatedAt = DateTime.UtcNow;

            await UpdateAsync(entity);
            return MapToDto(entity);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _repository.Where(c => c.Id == id).FirstOrDefaultAsync();
            if (entity == null) return false;

            entity.IsDeleted = true;
            entity.DeletedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;
            await UpdateAsync(entity);
            return true;
        }

        public async Task<CouponValidationResultDto> ValidateAsync(string code)
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                return new CouponValidationResultDto
                {
                    IsValid = false,
                    Message = "Coupon code is required"
                };
            }

            var now = DateTime.UtcNow;
            var normalizedCode = code.Trim().ToUpperInvariant();
            var coupon = await _repository
                .Where(c => c.Code.ToUpper() == normalizedCode)
                .FirstOrDefaultAsync();

            if (coupon == null)
            {
                return new CouponValidationResultDto
                {
                    IsValid = false,
                    Message = "Coupon not found"
                };
            }

            if (!coupon.IsActive)
            {
                return new CouponValidationResultDto
                {
                    IsValid = false,
                    Message = "Coupon is inactive",
                    Code = coupon.Code
                };
            }

            if (now < coupon.StartDate || now > coupon.EndDate)
            {
                return new CouponValidationResultDto
                {
                    IsValid = false,
                    Message = "Coupon is outside its valid date range",
                    Code = coupon.Code
                };
            }

            if (coupon.MaxUsage.HasValue && coupon.UsedCount >= coupon.MaxUsage.Value)
            {
                return new CouponValidationResultDto
                {
                    IsValid = false,
                    Message = "Coupon usage limit reached",
                    Code = coupon.Code
                };
            }

            return new CouponValidationResultDto
            {
                IsValid = true,
                Message = "Coupon is valid",
                Code = coupon.Code,
                Type = coupon.Type,
                Value = coupon.Value,
                CompanyId = coupon.CompanyId
            };
        }

        private static CouponDto MapToDto(Coupon c) => new()
        {
            Id = c.Id,
            Code = c.Code,
            CompanyId = c.CompanyId,
            Type = c.Type,
            Value = c.Value,
            StartDate = c.StartDate,
            EndDate = c.EndDate,
            UsedCount = c.UsedCount,
            MaxUsage = c.MaxUsage,
            IsActive = c.IsActive,
            CreatedAt = c.CreatedAt
        };
    }
}
