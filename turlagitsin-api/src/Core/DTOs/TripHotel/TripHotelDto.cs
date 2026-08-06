namespace Core.DTOs.TripHotel;

public class TripHotelDto
{
    public string Name { get; set; }
    public int Stars { get; set; }
    public string? Address { get; set; }
    public string? CheckIn { get; set; }
    public string? CheckOut { get; set; }
    public List<string> Amenities { get; set; } = new();
    public string? Description { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? MapLink { get; set; }
}