using Core.DTOs.Coupon;
using Core.Entities;

namespace Core.Services
{
    public interface ICouponService : IService<Coupon>
    {
        Task<List<CouponDto>> GetAllCouponsAsync();
        Task<CouponDto?> GetByIdAsync(Guid id);
        Task<CouponDto> CreateAsync(CreateCouponDto dto);
        Task<CouponDto?> UpdateAsync(Guid id, UpdateCouponDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<CouponValidationResultDto> ValidateAsync(string code);
    }
}
