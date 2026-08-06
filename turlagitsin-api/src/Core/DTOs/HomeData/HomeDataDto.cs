using Core.DTOs.CalendarTrip;
using Core.DTOs.Trip;
using Core.DTOs.Company;

namespace Core.DTOs.HomeData
{
    public class HomeDataDto
    {
        public List<TripListDto> FeaturedTrips { get; set; } = new();
        public List<CompanyListDto> TopCompanies { get; set; } = new();
        public List<CalendarTripDto> UpcomingTrips { get; set; } = new();
        public BannerDto? Banner { get; set; }
    }
}   