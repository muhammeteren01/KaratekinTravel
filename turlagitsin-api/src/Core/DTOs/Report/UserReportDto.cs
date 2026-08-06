namespace Core.DTOs.Report
{
    public class UserReportDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int NewUsers { get; set; }
        public int VerifiedUsers { get; set; }
        public List<UserActivityDto> TopActiveUsers { get; set; } = new();
    }
}