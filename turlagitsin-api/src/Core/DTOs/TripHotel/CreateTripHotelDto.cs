namespace Core.DTOs.TripHotel;

public class CreateTripHotelDto
{
    public Guid TripId { get; set; }
    public string Name { get; set; }
    public int Stars { get; set; }
    public string? Address { get; set; }
    public string? CheckIn { get; set; }
    public string? CheckOut { get; set; }
    public string? Description { get; set; }
    public List<string> Amenities { get; set; } = new();
}