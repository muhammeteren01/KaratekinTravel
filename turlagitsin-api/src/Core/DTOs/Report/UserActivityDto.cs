namespace Core.DTOs.Report
{
    public class UserActivityDto
    {
        public Guid UserId { get; set; }
        public string Name { get; set; }
        public int TotalReservations { get; set; }
        public int TotalReviews { get; set; }
        public decimal TotalSpent { get; set; }
    }
}