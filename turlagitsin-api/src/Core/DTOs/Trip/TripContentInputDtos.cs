namespace Core.DTOs.Trip;

/// <summary>
/// Tur içeriğinin yazma tarafı DTO'ları.
///
/// Bu alanlar entity ve okuma DTO'su (TripResponseDto) tarafında zaten vardı,
/// ancak hiçbir uç bunları kabul etmiyordu. Panel de bu yüzden güzergâh,
/// dahil/hariç olanlar, oteller ve iptal politikasını serbest metin olarak
/// Description alanına gömüyordu; veri sorgulanamıyor ve düzenlemede
/// geri okunamıyordu.
///
/// Alan adları ve şekilleri okuma DTO'larıyla bilinçli olarak birebir aynı
/// tutuldu; böylece istemci okuduğu yapıyı olduğu gibi geri gönderebiliyor.
/// </summary>
public class TripDetailsInputDto
{
    public List<string> Included { get; set; } = new();
    public List<string> Excluded { get; set; } = new();
    public string? SpecialNote { get; set; }
}

public class TripPolicyInputDto
{
    public string? Title { get; set; }
    public List<string> Paragraphs { get; set; } = new();
}

public class TripItineraryInputDto
{
    public int Day { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? DateLabel { get; set; }
    public string? Note { get; set; }
    public int? HotelIndex { get; set; }
    public List<ItineraryActivityInputDto> Activities { get; set; } = new();
}

public class ItineraryActivityInputDto
{
    public string Time { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class TripHotelInputDto
{
    public string Name { get; set; } = string.Empty;
    public int Stars { get; set; }
    public string? Address { get; set; }
    public string? CheckIn { get; set; }
    public string? CheckOut { get; set; }
    public string? Description { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? MapLink { get; set; }
    public List<string> Amenities { get; set; } = new();
}
