namespace Core.DTOs.Vehicle
{
    public class SeatLayoutDto
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Rows { get; set; }
        public int SeatsLeft { get; set; }
        public int SeatsRight { get; set; }
        public int TotalSeats { get; set; }
        public string SeatMapJson { get; set; } = "[]";
        public DateTime CreatedAt { get; set; }
    }
}
