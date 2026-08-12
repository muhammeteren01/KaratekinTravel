using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Core.DTOs.ResponseDto;
using Core.DTOs.TripSeatch;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using TripInputDtos = Core.DTOs.Trip;

namespace Service.Service
{
    public class TripService : Service<Trip>, ITripService
    {
        public TripService(IGenericRepository<Trip> repository, IUnitOfWork unitOfWork) 
            : base(repository, unitOfWork)
        {
        }

        public async Task<List<TripResponseDto>> GetAllTripsAsync()
        {
            var trips = await QueryTrips().ToListAsync();
            return trips.Select(MapToResponseDto).ToList();
        }

        public async Task<PagedResultDto<TripResponseDto>> SearchTripsAsync(TripSearchDto search)
        {
            var query = QueryTrips();

            if (!string.IsNullOrWhiteSpace(search.SearchTerm))
            {
                var term = search.SearchTerm.Trim().ToLower();
                query = query.Where(t =>
                    t.Title.ToLower().Contains(term) ||
                    (t.Location != null && t.Location.ToLower().Contains(term)) ||
                    (t.City != null && t.City.ToLower().Contains(term)) ||
                    (t.Description != null && t.Description.ToLower().Contains(term)));
            }

            if (!string.IsNullOrWhiteSpace(search.City))
                query = query.Where(t => t.City == search.City);

            if (!string.IsNullOrWhiteSpace(search.Region))
                query = query.Where(t => t.Region == search.Region);

            if (search.DateFrom.HasValue)
                query = query.Where(t => t.DateStart == null || t.DateStart >= search.DateFrom);

            if (search.DateTo.HasValue)
                query = query.Where(t => t.DateEnd == null || t.DateEnd <= search.DateTo);

            if (search.MinRating.HasValue)
                query = query.Where(t => t.Rating >= search.MinRating);

            if (search.MinPrice.HasValue)
                query = query.Where(t => t.Pricing != null && t.Pricing.BasePrice >= search.MinPrice);

            if (search.MaxPrice.HasValue)
                query = query.Where(t => t.Pricing != null && t.Pricing.BasePrice <= search.MaxPrice);

            query = query.Where(t => t.IsPublished);

            var page = search.Page < 1 ? 1 : search.Page;
            var pageSize = search.PageSize < 1 ? 20 : Math.Min(search.PageSize, 100);

            var totalCount = await query.CountAsync();
            var trips = await query
                .OrderByDescending(t => t.IsFeatured)
                .ThenByDescending(t => t.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResultDto<TripResponseDto>
            {
                Items = trips.Select(MapToResponseDto).ToList(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<TripResponseDto?> GetTripByIdAsync(Guid id)
        {
            var trip = await QueryTrips().FirstOrDefaultAsync(t => t.Id == id);
            return trip == null ? null : MapToResponseDto(trip);
        }

        private IQueryable<Trip> QueryTrips()
        {
            return _repository.Where(t => true)
                .Include(t => t.Company)
                .Include(t => t.Details!)
                    .ThenInclude(d => d.Included)
                .Include(t => t.Details!)
                    .ThenInclude(d => d.Excluded)
                .Include(t => t.Policy!)
                    .ThenInclude(p => p.Paragraphs)
                .Include(t => t.Itinerary)
                    .ThenInclude(i => i.Activities)
                .Include(t => t.Hotels!)
                    .ThenInclude(h => h.Amenities)
                .Include(t => t.Gallery)
                .Include(t => t.Pricing!)
                    .ThenInclude(p => p.Extras)
                .Include(t => t.Reviews);
        }

        private TripResponseDto MapToResponseDto(Trip trip)
        {
            var reviewCount = trip.Reviews?.Count ?? 0;
            var avgRating = reviewCount > 0 ? trip.Reviews!.Average(r => r.Rating) : 0;

            return new TripResponseDto
            {
                Id = trip.Id.ToString(),
                CompanyId = trip.CompanyId.ToString(),
                Title = trip.Title,
                Location = trip.Location ?? string.Empty,
                City = trip.City ?? string.Empty,
                Region = trip.Region ?? string.Empty,
                Rating = avgRating,
                ReviewCount = reviewCount,
                Price = trip.Pricing != null ? $"{trip.Pricing.BasePrice} {trip.Pricing.Currency}" : "0 TRY",
                Pricing = MapPricingDto(trip.Pricing),
                DateRange = trip.DateRange ?? string.Empty,
                DateStart = trip.DateStart?.ToString("yyyy-MM-dd") ?? string.Empty,
                DateEnd = trip.DateEnd?.ToString("yyyy-MM-dd") ?? string.Empty,
                CreatedAt = trip.CreatedAt,
                UpdatedAt = trip.UpdatedAt,
                Capacity = trip.Capacity,
                JoinedCount = trip.JoinedCount,
                Avatars = new List<string>(), // TODO: Get from reservations
                Image = trip.Image ?? string.Empty,
                HeaderImage = trip.HeaderImage ?? string.Empty,
                Gallery = trip.Gallery?.Select(g => g.ImageUrl).ToList() ?? new(),
                Description = trip.Description ?? string.Empty,
                IsPublished = trip.IsPublished,
                IsFeatured = trip.IsFeatured,
                IsDeleted = trip.IsDeleted,
                Purchased = false, // TODO: Check user's reservations
                Details = MapDetailsDto(trip.Details),
                Policy = MapPolicyDto(trip.Policy),
                Itinerary = trip.Itinerary?.OrderBy(i => i.DisplayOrder).Select(MapItineraryDto).ToList() ?? new(),
                Hotels = trip.Hotels?.OrderBy(h => h.DisplayOrder).Select(MapHotelDto).ToList() ?? new()
            };
        }

        private TripPricingDto MapPricingDto(TripPricing? pricing)
        {
            if (pricing == null)
                return new TripPricingDto { Currency = "TRY", BasePrice = 0 };

            return new TripPricingDto
            {
                Currency = pricing.Currency,
                BasePrice = pricing.BasePrice,
                Discount = pricing.DiscountAmount.HasValue ? new TripDiscountDto
                {
                    Label = pricing.DiscountLabel ?? string.Empty,
                    Amount = pricing.DiscountAmount.Value
                } : null,
                Extras = pricing.Extras?.OrderBy(e => e.DisplayOrder).Select(e => new TripExtraDto
                {
                    Label = e.Label,
                    Amount = e.Amount
                }).ToList() ?? new()
            };
        }

        private TripDetailsDto MapDetailsDto(TripDetails? details)
        {
            if (details == null)
                return new TripDetailsDto();

            return new TripDetailsDto
            {
                Included = details.Included?.OrderBy(i => i.DisplayOrder).Select(i => i.Item).ToList() ?? new(),
                Excluded = details.Excluded?.OrderBy(e => e.DisplayOrder).Select(e => e.Item).ToList() ?? new(),
                SpecialNote = details.SpecialNote ?? string.Empty
            };
        }

        private TripPolicyDto MapPolicyDto(TripPolicy? policy)
        {
            if (policy == null)
                return new TripPolicyDto { Title = "İptal ve Değişiklik Politikası" };

            return new TripPolicyDto
            {
                Title = policy.Title ?? "İptal ve Değişiklik Politikası",
                Paragraphs = policy.Paragraphs?.OrderBy(p => p.DisplayOrder).Select(p => p.Content).ToList() ?? new()
            };
        }

        private TripItineraryDto MapItineraryDto(TripItinerary itinerary)
        {
            return new TripItineraryDto
            {
                Day = itinerary.Day,
                Title = itinerary.Title,
                DateLabel = itinerary.DateLabel ?? string.Empty,
                Activities = itinerary.Activities?.OrderBy(a => a.DisplayOrder).Select(a => new ItineraryActivityDto
                {
                    Time = a.Time,
                    Label = a.Label,
                    Description = a.Description ?? string.Empty
                }).ToList() ?? new(),
                Note = itinerary.Note ?? string.Empty,
                HotelIndex = itinerary.HotelIndex
            };
        }

        private TripHotelDto MapHotelDto(TripHotel hotel)
        {
            return new TripHotelDto
            {
                Name = hotel.Name,
                Stars = hotel.Stars,
                Address = hotel.Address ?? string.Empty,
                Image = string.Empty, // TODO: Add hotel image property
                Gallery = new List<string>(), // TODO: Add hotel gallery
                CheckIn = hotel.CheckIn ?? string.Empty,
                CheckOut = hotel.CheckOut ?? string.Empty,
                Amenities = hotel.Amenities?.OrderBy(a => a.DisplayOrder).Select(a => a.Name).ToList() ?? new(),
                Description = hotel.Description ?? string.Empty,
                Phone = hotel.Phone ?? string.Empty,
                Website = hotel.Website ?? string.Empty,
                MapLink = hotel.MapLink ?? string.Empty
            };
        }

        public async Task<TripResponseDto> CreateTripAsync(TripInputDtos.CreateTripDto dto)
        {
            var trip = new Trip
            {
                CompanyId = dto.CompanyId,
                Title = dto.Title,
                Location = dto.Location,
                City = dto.City,
                Region = dto.Region,
                DateStart = dto.DateStart,
                DateEnd = dto.DateEnd,
                Capacity = dto.Capacity,
                Image = dto.Image,
                HeaderImage = dto.HeaderImage,
                Description = dto.Description,
                IsFeatured = dto.IsFeatured,
                IsPublished = dto.IsPublished ?? true,
                JoinedCount = 0,
                ViewCount = 0
            };

            if (dto.Pricing != null)
            {
                trip.Pricing = new TripPricing
                {
                    TripId = trip.Id,
                    Currency = string.IsNullOrWhiteSpace(dto.Pricing.Currency) ? "TRY" : dto.Pricing.Currency,
                    BasePrice = dto.Pricing.BasePrice,
                    DiscountLabel = dto.Pricing.DiscountLabel,
                    DiscountAmount = dto.Pricing.DiscountAmount
                };
            }

            await AddAsync(trip);
            return MapToResponseDto(trip);
        }

        public async Task<TripResponseDto?> UpdateTripAsync(Guid id, TripInputDtos.UpdateTripDto dto)
        {
            // Pricing include edilmezse mevcut fiyat satırı null görünür ve
            // aşağıdaki ??= her güncellemede yeni bir satır oluşturur.
            var trip = await _repository.Where(t => t.Id == id)
                .Include(t => t.Pricing)
                .FirstOrDefaultAsync();
            if (trip == null) return null;

            if (dto.Title != null) trip.Title = dto.Title;
            if (dto.Location != null) trip.Location = dto.Location;
            if (dto.City != null) trip.City = dto.City;
            if (dto.Region != null) trip.Region = dto.Region;
            if (dto.DateStart.HasValue) trip.DateStart = dto.DateStart.Value;
            if (dto.DateEnd.HasValue) trip.DateEnd = dto.DateEnd.Value;
            if (dto.Capacity.HasValue) trip.Capacity = dto.Capacity.Value;
            if (dto.Image != null) trip.Image = dto.Image;
            if (dto.Description != null) trip.Description = dto.Description;
            if (dto.HeaderImage != null) trip.HeaderImage = dto.HeaderImage;
            if (dto.IsFeatured.HasValue) trip.IsFeatured = dto.IsFeatured.Value;
            if (dto.IsPublished.HasValue) trip.IsPublished = dto.IsPublished.Value;

            if (dto.Pricing != null)
            {
                trip.Pricing ??= new TripPricing { TripId = trip.Id };
                trip.Pricing.Currency = string.IsNullOrWhiteSpace(dto.Pricing.Currency) ? "TRY" : dto.Pricing.Currency;
                trip.Pricing.BasePrice = dto.Pricing.BasePrice;
                trip.Pricing.DiscountLabel = dto.Pricing.DiscountLabel;
                trip.Pricing.DiscountAmount = dto.Pricing.DiscountAmount;
            }

            trip.UpdatedAt = DateTime.UtcNow;

            await UpdateAsync(trip);
            return await GetTripByIdAsync(id);
        }

        public async Task<bool> DeleteTripAsync(Guid id)
        {
            var trip = await _repository.Where(t => t.Id == id).FirstOrDefaultAsync();
            if (trip == null) return false;

            trip.IsDeleted = true;
            trip.DeletedAt = DateTime.UtcNow;
            await UpdateAsync(trip);
            return true;
        }
    }
}
