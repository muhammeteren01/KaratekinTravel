namespace Core.DTOs.Trip;
    
public class TripListDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string? Location { get; set; }
    public string? City { get; set; }
    public decimal Rating { get; set; }
    public int ReviewCount { get; set; }
    public string? Image { get; set; }
    public DateTime? DateStart { get; set; }
    public DateTime? DateEnd { get; set; }
    public string? DateRange { get; set; }
    public string? PeopleCountLabel { get; set; }
    public decimal? BasePrice { get; set; }
    public string? Currency { get; set; }
    public string? CompanyName { get; set; }
    public int JoinedCount { get; set; }
    public int Capacity { get; set; }
    public List<string> Avatars { get; set; } = new();
}