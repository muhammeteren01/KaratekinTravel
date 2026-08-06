namespace Core.DTOs.TripSeatch;

public class TripSearchDto
{
    public string? SearchTerm { get; set; }
    public string? City { get; set; }
    public string? Region { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public decimal? MinRating { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}