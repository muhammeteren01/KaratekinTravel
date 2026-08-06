namespace Core.DTOs.TripStatics;

public class TripStaticsDto
{
    public Guid TripId { get; set; }
    public string Title { get; set; }
    public int Capacity { get; set; }
    public int JoinedCount { get; set; }
    public int ViewCount { get; set; }
    public int TotalReservations { get; set; }
    public int TotalReviews { get; set; }
    public decimal AvgReviewRating { get; set; }
    public int ConfirmedReservations { get; set; }
    public int CancelledReservations { get; set; }
}