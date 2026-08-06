namespace Core.DTOs.Report
{
    public class FinanceReportDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal RefundAmount { get; set; }
        public decimal NetProfit { get; set; }
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }
        public List<CompletedTripEarningDto> CompletedTripEarnings { get; set; } = new();
    }

    public class CompletedTripEarningDto
    {
        public string TourCode { get; set; } = string.Empty;
        public string TourName { get; set; } = string.Empty;
        public DateTime TourDate { get; set; }
        public decimal NetEarning { get; set; }
    }
}
