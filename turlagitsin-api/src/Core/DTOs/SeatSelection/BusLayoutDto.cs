namespace Core.DTOs.SeatSelection
{
    public class BusLayoutDto
    {
        public int Rows { get; set; }
        public int SeatsLeft { get; set; }
        public int SeatsRight { get; set; }
        public int TotalSeats { get; set; }
        public List<int> SoldSeats { get; set; } = new();
        public List<int> SelectedSeats { get; set; } = new();
    }
}