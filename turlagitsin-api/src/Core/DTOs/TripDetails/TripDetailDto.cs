using Core.DTOs.TripHotel;
using Core.DTOs.TripItenarary;
using Core.DTOs.Company;
using Core.DTOs.Trip;

namespace Core.DTOs.TripDetails;

public class TripDetailDto
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
    public bool IsPurchased { get; set; }
        
    // Related Data
    public CompanyListDto? Company { get; set; }
    public TripPricingDto? Pricing { get; set; }
    public TripDetailsInfoDto? Details { get; set; }
    public TripPolicyDto? Policy { get; set; }
    public List<string> Gallery { get; set; } = new();
    public List<TripItinararyDto> Itinerary { get; set; } = new();
    public List<TripHotelDto> Hotels { get; set; } = new();
    public List<string> Avatars { get; set; } = new();
}