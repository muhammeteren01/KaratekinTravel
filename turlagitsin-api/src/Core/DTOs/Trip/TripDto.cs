using Core.DTOs.Company;

namespace Core.DTOs.Trip;

public class TripDto
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public string Title { get; set; }
    public string? Location { get; set; }
    public string? City { get; set; }
    public string? Region { get; set; }
    public decimal Rating { get; set; }
    public int ReviewCount { get; set; }
    public string? DateRange { get; set; }
    public DateTime? DateStart { get; set; }
    public DateTime? DateEnd { get; set; }
    public int Capacity { get; set; }
    public int JoinedCount { get; set; }
    public string? Image { get; set; }
    public string? HeaderImage { get; set; }
    public string? Description { get; set; }
    public bool IsFeatured { get; set; }
    public int ViewCount { get; set; }
        
    // Related Data
    public CompanyListDto? Company { get; set; }
    public TripPricingDto? Pricing { get; set; }
    public List<string> Avatars { get; set; } = new();
    public string? PeopleCountLabel { get; set; }
}