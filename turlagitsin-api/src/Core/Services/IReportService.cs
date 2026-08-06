using Core.DTOs.Report;

namespace Core.Services
{
    public interface IReportService
    {
        Task<TripReportDto> GetTripReportAsync(DateTime start, DateTime end);
        Task<CompanyReportDto> GetCompanyReportAsync(DateTime? start = null, DateTime? end = null);
        Task<FinanceReportDto> GetFinanceReportAsync(Guid? companyId, DateTime start, DateTime end);
        Task<List<UserActivityDto>> GetUserActivityAsync();
    }
}
