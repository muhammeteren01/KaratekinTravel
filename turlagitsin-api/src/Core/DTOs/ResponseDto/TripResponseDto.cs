namespace Core.DTOs.ResponseDto
{
    public class TripResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string CompanyId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
        public string Price { get; set; } = string.Empty;
        public TripPricingDto Pricing { get; set; } = new();
        public string DateRange { get; set; } = string.Empty;
        public string DateStart { get; set; } = string.Empty;
        public string DateEnd { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int Capacity { get; set; }
        public int JoinedCount { get; set; }
        public List<string> Avatars { get; set; } = new();
        public string Image { get; set; } = string.Empty;
        public string HeaderImage { get; set; } = string.Empty;
        public List<string> Gallery { get; set; } = new();
        public string Description { get; set; } = string.Empty;
        public bool IsPublished { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsDeleted { get; set; }
        public bool Purchased { get; set; }
        public TripDetailsDto Details { get; set; } = new();
        public TripPolicyDto Policy { get; set; } = new();
        public List<TripItineraryDto> Itinerary { get; set; } = new();
        public List<TripHotelDto> Hotels { get; set; } = new();
    }

    public class TripPricingDto
    {
        public string Currency { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public TripDiscountDto? Discount { get; set; }
        public List<TripExtraDto> Extras { get; set; } = new();
    }

    public class TripDiscountDto
    {
        public string Label { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public class TripExtraDto
    {
        public string Label { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public class TripDetailsDto
    {
        public List<string> Included { get; set; } = new();
        public List<string> Excluded { get; set; } = new();
        public string SpecialNote { get; set; } = string.Empty;
    }

    public class TripPolicyDto
    {
        public string Title { get; set; } = string.Empty;
        public List<string> Paragraphs { get; set; } = new();
    }

    public class TripItineraryDto
    {
        public int Day { get; set; }
        public string Title { get; set; } = string.Empty;
        public string DateLabel { get; set; } = string.Empty;
        public List<ItineraryActivityDto> Activities { get; set; } = new();
        public string Note { get; set; } = string.Empty;
        public int? HotelIndex { get; set; }
    }

    public class ItineraryActivityDto
    {
        public string Time { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class TripHotelDto
    {
        public string Name { get; set; } = string.Empty;
        public int Stars { get; set; }
        public string Address { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public List<string> Gallery { get; set; } = new();
        public string CheckIn { get; set; } = string.Empty;
        public string CheckOut { get; set; } = string.Empty;
        public List<string> Amenities { get; set; } = new();
        public string Description { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Website { get; set; } = string.Empty;
        public string MapLink { get; set; } = string.Empty;
    }
}
