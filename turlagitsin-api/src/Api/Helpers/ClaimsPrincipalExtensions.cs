using System.Security.Claims;
using Core.Enums;

namespace Api.Helpers
{
    public static class ClaimsPrincipalExtensions
    {
        public static Guid GetUserId(this ClaimsPrincipal user)
        {
            var value = user.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? user.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(value) || !Guid.TryParse(value, out var userId))
                throw new UnauthorizedAccessException("User id claim is missing or invalid.");

            return userId;
        }

        public static bool TryGetUserId(this ClaimsPrincipal user, out Guid userId)
        {
            userId = Guid.Empty;
            var value = user.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? user.FindFirstValue("sub");

            return !string.IsNullOrWhiteSpace(value) && Guid.TryParse(value, out userId);
        }

        public static string? GetUserRole(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(ClaimTypes.Role);
        }

        /// <summary>
        /// Token'daki companyId claim'i. CompanyAdmin hesaplarında dolu,
        /// platform Admin'inde ve normal kullanıcıda null.
        /// </summary>
        public static Guid? GetCompanyId(this ClaimsPrincipal user)
        {
            var value = user.FindFirstValue("companyId");
            return Guid.TryParse(value, out var companyId) ? companyId : null;
        }

        public static bool IsPlatformAdmin(this ClaimsPrincipal user)
        {
            return string.Equals(user.GetUserRole(), UserRole.Admin, StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Platform admini her şirkete erişir; CompanyAdmin yalnızca kendi
        /// şirketine. Yazma uçlarında sahiplik doğrulaması için kullanılır.
        /// </summary>
        public static bool CanAccessCompany(this ClaimsPrincipal user, Guid companyId)
        {
            if (user.IsPlatformAdmin()) return true;
            var own = user.GetCompanyId();
            return own.HasValue && own.Value == companyId;
        }
    }
}
