using Core.DTOs.SeatSelection;
using Core.Repositories;
using Core.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Service.Service
{
    public class SeatAvailabilityService : ISeatAvailabilityService
    {
        private readonly IReservationRepository _reservationRepository;

        public SeatAvailabilityService(IReservationRepository reservationRepository)
        {
            _reservationRepository = reservationRepository;
        }

        public async Task<SoldSeatsResponseDto> GetSoldSeatsForDepartureAsync(Guid departureId)
        {
            var reservations = await _reservationRepository
                .Where(r => r.DepartureId == departureId &&
                            r.Status != null &&
                            r.Status.ToLower() != "cancelled")
                .ToListAsync();

            var soldSeats = ParseSoldSeats(reservations.Select(r => r.SeatNumbers));

            return new SoldSeatsResponseDto
            {
                DepartureId = departureId,
                SoldSeats = soldSeats,
                TotalSold = soldSeats.Count
            };
        }

        public async Task<SoldSeatsResponseDto> GetSoldSeatsForTripAsync(Guid tripId)
        {
            var reservations = await _reservationRepository
                .Where(r => r.TripId == tripId &&
                            r.Status != null &&
                            r.Status.ToLower() != "cancelled")
                .ToListAsync();

            var soldSeats = ParseSoldSeats(reservations.Select(r => r.SeatNumbers));

            return new SoldSeatsResponseDto
            {
                TripId = tripId,
                SoldSeats = soldSeats,
                TotalSold = soldSeats.Count
            };
        }

        private static List<int> ParseSoldSeats(IEnumerable<string> seatNumberJsonList)
        {
            var seats = new HashSet<int>();

            foreach (var json in seatNumberJsonList)
            {
                if (string.IsNullOrWhiteSpace(json)) continue;

                try
                {
                    var parsed = JsonSerializer.Deserialize<List<int>>(json);
                    if (parsed == null) continue;
                    foreach (var seat in parsed)
                        seats.Add(seat);
                }
                catch
                {
                    // ignore malformed seat JSON
                }
            }

            return seats.OrderBy(s => s).ToList();
        }
    }
}
