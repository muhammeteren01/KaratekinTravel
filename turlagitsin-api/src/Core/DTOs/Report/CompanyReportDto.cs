using Core.DTOs.TripStatics;

namespace Core.DTOs.Report
{
    public class CompanyReportDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalCompanies { get; set; }
        public int ActiveCompanies { get; set; }
        public decimal AverageCompanyRating { get; set; }
        public List<CompanyStaticsDto> TopCompanies { get; set; } = new();
    }
}