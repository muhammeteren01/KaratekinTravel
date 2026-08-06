namespace Core.DTOs.TripStatics;

public class CompanyStaticsDto
{
    public Guid CompanyId { get; set; }
    public string Name { get; set; }
    public decimal Rating { get; set; }
    public int ReviewCount { get; set; }
    public int TotalTrips { get; set; }
    public int TotalReservations { get; set; }
    public int PublishedTrips { get; set; }
    public int FeaturedTrips { get; set; }
}