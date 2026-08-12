namespace Core.DTOs.Trip;

public class UpdateTripDto
{
    public string? Title { get; set; }
    public string? Location { get; set; }
    public string? City { get; set; }
    public string? Region { get; set; }
    public DateTime? DateStart { get; set; }
    public DateTime? DateEnd { get; set; }
    public int? Capacity { get; set; }
    public string? Image { get; set; }
    public string? Description { get; set; }
    public string? HeaderImage { get; set; }
    public bool? IsFeatured { get; set; }

    // Turun kullanıcılara görünürlüğü. Bu alan olmadan bir tur yayından
    // kaldırılamıyordu: entity'de IsPublished vardı ve TripResponseDto ile
    // okunabiliyordu, ama hiçbir uç değerini değiştiremiyordu.
    public bool? IsPublished { get; set; }

    // Fiyat güncellemesi. Create tarafıyla aynı sebep: bu alan olmadan panelden
    // değiştirilen fiyat sessizce yok sayılıyordu.
    public CreateTripPricingDto? Pricing { get; set; }
}