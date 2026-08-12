namespace Core.DTOs.Trip;

public class CreateTripDto
{
    public Guid CompanyId { get; set; }
    public string Title { get; set; }
    public string? Location { get; set; }
    public string? City { get; set; }
    public string? Region { get; set; }
    public DateTime? DateStart { get; set; }
    public DateTime? DateEnd { get; set; }
    public int Capacity { get; set; }
    public string? Image { get; set; }
    public string? HeaderImage { get; set; }
    public string? Description { get; set; }
    public bool IsFeatured { get; set; }

    // Tur fiyatı. Bu alan olmadan panelin sihirbazında girilen fiyatın
    // gidecek yeri yoktu ve serbest metin olarak Description'a gömülüyordu;
    // sonuçta listelerde her tur "0 TRY" görünüyordu.
    public CreateTripPricingDto? Pricing { get; set; }

    // Yeni turlar taslak olarak açılabilsin diye; verilmezse yayında başlar.
    public bool? IsPublished { get; set; }

    // Tur içeriği. Bu alanlar olmadan güzergâh, dahil/hariç olanlar, oteller
    // ve iptal politikası kaydedilemiyor; panel bunları Description'a
    // düz metin olarak gömmek zorunda kalıyordu.
    public TripDetailsInputDto? Details { get; set; }
    public TripPolicyInputDto? Policy { get; set; }
    public List<TripItineraryInputDto>? Itinerary { get; set; }
    public List<TripHotelInputDto>? Hotels { get; set; }
}
