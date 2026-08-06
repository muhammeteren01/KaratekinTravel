using Core.DTOs.TripStatics;

namespace Core.DTOs.Report
{
    public class TripReportDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalTrips { get; set; }
        public int CompletedTrips { get; set; }
        public int CancelledTrips { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalReservations { get; set; }
        public decimal AverageRating { get; set; }
        public List<TripStaticsDto> TopTrips { get; set; } = new();
    }
}