namespace Core.DTOs.Gallery;

    
public class UploadImageDto
{
    public Guid TripId { get; set; }
    public string ImageUrl { get; set; }
    public string? Caption { get; set; }
}