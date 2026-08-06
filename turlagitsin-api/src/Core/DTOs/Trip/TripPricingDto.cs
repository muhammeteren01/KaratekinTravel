namespace Core.DTOs.Trip;

public class TripPricingDto
{
    public string Currency { get; set; } = "TRY";
    public decimal BasePrice { get; set; }
    public DiscountDto? Discount { get; set; }
    public List<PricingExtraDto> Extras { get; set; } = new();
}