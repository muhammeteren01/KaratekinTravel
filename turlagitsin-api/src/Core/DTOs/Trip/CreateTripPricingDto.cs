namespace Core.DTOs.Trip;

public class CreateTripPricingDto
{
    public Guid TripId { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal BasePrice { get; set; }
    public string? DiscountLabel { get; set; }
    public decimal? DiscountAmount { get; set; }
    public List<PricingExtraDto> Extras { get; set; } = new();
}