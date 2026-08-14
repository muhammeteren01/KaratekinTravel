using Core.DTOs.ResponseDto;
using Core.Services;
using Microsoft.EntityFrameworkCore;
using Core.Repositories;
using Core.Entities;

namespace Service.Service
{
    public class BootstrapService : IBootstrapService
    {
        private readonly ITripService _tripService;
        private readonly ICompanyService _companyService;
        private readonly IUserService _userService;
        private readonly IReservationService _reservationService;
        private readonly IReviewService _reviewService;
        private readonly IGenericRepository<CalendarTrip> _calendarTripRepository;
        private readonly IGenericRepository<UserNotification> _notificationRepository;
        private readonly IGenericRepository<UserSavedTrip> _savedTripRepository;
        private readonly IGenericRepository<ChatGroup> _chatGroupRepository;
        private readonly IGenericRepository<ChatMessage> _chatMessageRepository;
        private readonly IGenericRepository<ChatGroupMember> _chatGroupMemberRepository;
        private readonly IGenericRepository<CompanyReview> _companyReviewRepository;

        public BootstrapService(
            ITripService tripService,
            ICompanyService companyService,
            IUserService userService,
            IReservationService reservationService,
            IReviewService reviewService,
            IGenericRepository<CalendarTrip> calendarTripRepository,
            IGenericRepository<UserNotification> notificationRepository,
            IGenericRepository<UserSavedTrip> savedTripRepository,
            IGenericRepository<ChatGroup> chatGroupRepository,
            IGenericRepository<ChatMessage> chatMessageRepository,
            IGenericRepository<ChatGroupMember> chatGroupMemberRepository,
            IGenericRepository<CompanyReview> companyReviewRepository)
        {
            _tripService = tripService;
            _companyService = companyService;
            _userService = userService;
            _reservationService = reservationService;
            _reviewService = reviewService;
            _calendarTripRepository = calendarTripRepository;
            _notificationRepository = notificationRepository;
            _savedTripRepository = savedTripRepository;
            _chatGroupRepository = chatGroupRepository;
            _chatMessageRepository = chatMessageRepository;
            _chatGroupMemberRepository = chatGroupMemberRepository;
            _companyReviewRepository = companyReviewRepository;
        }

        public async Task<BootstrapResponseDto> GetBootstrapDataAsync()
        {
            // Get main data
            var companies = await _companyService.GetAllCompaniesAsync();
            var trips = await _tripService.GetAllTripsAsync();
            var users = await _userService.GetAllUsersAsync();
            var reservations = await _reservationService.GetAllReservationsAsync();
            var reviews = await _reviewService.GetAllReviewsAsync();

            // Get supporting data
            var calendarTrips = await GetCalendarTripsAsync();
            var notifications = await GetNotificationsAsync();
            var savedTrips = await GetUserStatesAsync();
            var chats = await GetChatsAsync();
            var companyReviews = await GetCompanyReviewsAsync();

            return new BootstrapResponseDto
            {
                Version = 1,
                Companies = companies,
                Trips = trips,
                Users = users,
                Reservations = reservations,
                Reviews = reviews,
                SupportingData = new SupportingDataDto
                {
                    FeaturedTripIds = trips.Take(3).Select(t => t.Id).ToList(),
                    CalendarTrips = calendarTrips,
                    Notifications = notifications,
                    RouteStops = new List<RouteStopDto>(), // TODO: Implement if needed
                    ReservationPresets = new List<ReservationPresetDto>(), // TODO: Implement if needed
                    CompanyReviews = companyReviews,
                    PastTrips = BuildPastTrips(trips, companies, reviews, users),
                    OnboardingSlides = GetOnboardingSlides(),
                    UserState = savedTrips,
                    Chats = chats
                }
            };
        }

        private async Task<List<CalendarTripDto>> GetCalendarTripsAsync()
        {
            var calendarTrips = await _calendarTripRepository.Where(ct => true)
                .Include(ct => ct.Trip)
                .ToListAsync();

            return calendarTrips.Select(ct => new CalendarTripDto
            {
                Id = ct.Id.ToString(),
                Title = ct.Trip?.Title ?? string.Empty,
                Location = ct.Trip?.Location ?? string.Empty,
                Date = ct.Date.ToString("dd MMMM yyyy"),
                Time = ct.Date.ToString("HH:mm"),
                Image = ct.Trip?.Image ?? string.Empty
            }).ToList();
        }

        private async Task<NotificationsDto> GetNotificationsAsync()
        {
            var notifications = await _notificationRepository.Where(n => true)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            var recent = notifications.Take(10).Select(n => new NotificationItemDto
            {
                Id = n.Id.ToString(),
                Title = n.Title,
                Message = n.Message,
                Time = GetRelativeTime(n.CreatedAt),
                AvatarColor = GetAvatarColor(n.Type),
                AvatarEmoji = GetAvatarEmoji(n.Type)
            }).ToList();

            var archived = notifications.Skip(10).Select(n => new NotificationItemDto
            {
                Id = n.Id.ToString(),
                Title = n.Title,
                Message = n.Message,
                Time = GetRelativeTime(n.CreatedAt),
                AvatarColor = GetAvatarColor(n.Type),
                AvatarEmoji = GetAvatarEmoji(n.Type)
            }).ToList();

            return new NotificationsDto
            {
                Recent = recent,
                Archived = archived
            };
        }

        private async Task<List<UserStateDto>> GetUserStatesAsync()
        {
            var savedTrips = await _savedTripRepository.Where(st => true)
                .GroupBy(st => st.UserId)
                .ToListAsync();

            return savedTrips.Select(g => new UserStateDto
            {
                UserId = g.Key.ToString(),
                SavedTripIds = g.Select(st => st.TripId.ToString()).ToList(),
                PurchasedTripIds = new List<string>() // TODO: Get from reservations
            }).ToList();
        }

        private async Task<ChatsDto> GetChatsAsync()
        {
            var chatGroups = await _chatGroupRepository.Where(cg => true)
                .Include(cg => cg.Trip)
                .ToListAsync();

            var groupDtos = chatGroups.Select(cg => new ChatGroupDto
            {
                Id = cg.Id.ToString(),
                GroupName = cg.GroupName,
                LastMessage = cg.LastMessage ?? string.Empty,
                Time = (cg.LastMessageTime.HasValue ? cg.LastMessageTime.Value : cg.CreatedAt).ToString("HH:mm"),
                IsActive = cg.IsActive,
                Avatar = cg.Avatar ?? string.Empty
            }).ToList();

            var groupMemberAvatars = new Dictionary<string, List<string>>();
            var groupMessages = new Dictionary<string, List<ChatMessageDto>>();

            foreach (var group in chatGroups)
            {
                // Get member avatars
                var members = await _chatGroupMemberRepository.Where(m => m.GroupId == group.Id)
                    .Include(m => m.User)
                    .ToListAsync();
                
                groupMemberAvatars[group.Id.ToString()] = members
                    .Select(m => m.User?.Avatar ?? string.Empty)
                    .Where(a => !string.IsNullOrEmpty(a))
                    .ToList();

                // Get messages
                var messages = await _chatMessageRepository.Where(m => m.GroupId == group.Id)
                    .Include(m => m.Sender)
                    .OrderBy(m => m.CreatedAt)
                    .ToListAsync();

                groupMessages[group.Id.ToString()] = messages.Select(m => new ChatMessageDto
                {
                    Id = m.Id.ToString(),
                    Text = m.Text,
                    Time = m.CreatedAt.ToString("HH:mm"),
                    IsOwn = false, // TODO: Check current user
                    Avatar = m.Sender?.Avatar ?? string.Empty,
                    IsDelivered = true,
                    IsRead = m.IsRead
                }).ToList();
            }

            return new ChatsDto
            {
                Groups = groupDtos,
                GroupMemberAvatars = groupMemberAvatars,
                GroupMessages = groupMessages,
                CompanyContact = new List<CompanyContactMessageDto>()
            };
        }

        /// <summary>
        /// Bitmis turlari, zaten yuklenmis tur/firma/degerlendirme listelerinden
        /// turetir. Onceden burasi bos liste donduruyordu (TODO), bu yuzden
        /// uygulamadaki "Gecmis Turlar" ekrani hep bostu.
        ///
        /// Bitmis sayilma olcutu: turun bitis tarihi bugunden once. Bitis tarihi
        /// girilmemis turlar hesaba katilmiyor; "tarihi yok" ile "tarihi gecti"
        /// ayni sey degil.
        /// </summary>
        private static List<PastTripDto> BuildPastTrips(
            List<TripResponseDto> trips,
            List<CompanyResponseDto> companies,
            List<ReviewResponseDto> reviews,
            List<UserResponseDto> users)
        {
            var today = DateTime.UtcNow.Date;
            var companyNames = companies.ToDictionary(c => c.Id, c => c.Name);
            var usersById = users.ToDictionary(u => u.Id);
            var reviewsByTrip = reviews
                .GroupBy(r => r.TripId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var result = new List<PastTripDto>();

            foreach (var trip in trips)
            {
                if (!DateTime.TryParse(trip.DateEnd, out var end) || end.Date >= today)
                    continue;

                var tripReviews = reviewsByTrip.TryGetValue(trip.Id, out var rs)
                    ? rs
                    : new List<ReviewResponseDto>();

                var hotel = trip.Hotels.FirstOrDefault();

                result.Add(new PastTripDto
                {
                    Id = trip.Id,
                    Title = trip.Title,
                    Location = trip.Location,
                    City = trip.City,
                    Rating = trip.Rating,
                    ReviewCount = trip.ReviewCount,
                    Image = trip.Image,
                    HeaderImage = trip.HeaderImage,
                    Gallery = trip.Gallery,
                    About = trip.Description,
                    Date = string.IsNullOrWhiteSpace(trip.DateRange) ? trip.DateEnd : trip.DateRange,
                    CompanyId = trip.CompanyId,
                    CompanyName = companyNames.TryGetValue(trip.CompanyId, out var name) ? name : string.Empty,
                    PriceText = trip.Price,
                    Timeline = BuildTimeline(trip),
                    Hotel = hotel == null
                        ? new PastTripHotelDto()
                        : new PastTripHotelDto
                        {
                            Title = hotel.Name,
                            DurationText = BuildStayText(trip),
                            Rating = hotel.Stars
                        },
                    Reviews = tripReviews.Select(r =>
                    {
                        usersById.TryGetValue(r.UserId, out var author);
                        return new PastTripReviewDto
                        {
                            Id = r.Id,
                            Name = author?.Name ?? string.Empty,
                            Avatar = new AvatarDto { Uri = author?.Avatar ?? string.Empty },
                            Rating = r.Rating,
                            Text = r.Comment
                        };
                    }).ToList()
                });
            }

            return result
                .OrderByDescending(t => DateTime.TryParse(t.Date, out var d) ? d : DateTime.MinValue)
                .ToList();
        }

        /// <summary>
        /// Tur programindaki etkinlikleri zaman cizelgesi ogelerine cevirir.
        /// Tur bitmis oldugu icin tum ogeler tamamlanmis isaretleniyor.
        /// </summary>
        private static List<TimelineItemDto> BuildTimeline(TripResponseDto trip)
        {
            return trip.Itinerary
                .OrderBy(i => i.Day)
                .SelectMany(day => day.Activities.Select(a => new TimelineItemDto
                {
                    Id = $"{trip.Id}-{day.Day}-{a.Label}",
                    Title = string.IsNullOrWhiteSpace(a.Label) ? day.Title : a.Label,
                    Time = a.Time,
                    Image = trip.Image,
                    IsCompleted = true
                }))
                .ToList();
        }

        /// <summary>Konaklama suresini tur tarihlerinden gun cinsinden yazar.</summary>
        private static string BuildStayText(TripResponseDto trip)
        {
            if (!DateTime.TryParse(trip.DateStart, out var start)) return string.Empty;
            if (!DateTime.TryParse(trip.DateEnd, out var end)) return string.Empty;
            var days = (end.Date - start.Date).Days;
            return days > 0 ? $"{days} Gun Konaklama" : string.Empty;
        }

        private async Task<List<CompanyReviewItemDto>> GetCompanyReviewsAsync()
        {
            var reviews = await _companyReviewRepository.Where(cr => true)
                .Include(cr => cr.User)
                .OrderByDescending(cr => cr.CreatedAt)
                .ToListAsync();

            return reviews.Select(review => new CompanyReviewItemDto
            {
                Id = review.Id.ToString(),
                CompanyId = review.CompanyId.ToString(),
                Name = review.User?.Name ?? string.Empty,
                Trip = review.TripName,
                Date = review.CreatedAt.ToString("dd MMMM yyyy"),
                Rating = review.Rating,
                Comment = review.Comment ?? string.Empty,
                Avatar = review.User?.Avatar ?? string.Empty
            }).ToList();
        }

        private List<OnboardingSlideDto> GetOnboardingSlides()
        {
            return new List<OnboardingSlideDto>
            {
                new()
                {
                    Id = "1",
                    Image = "asset:onboarding1",
                    Title = "Turlarınızı Keşfedin",
                    HighlightText = "Keşfedin",
                    Description = "Binlerce tur arasından size en uygun olanı bulun",
                    BackgroundColor = new List<string> { "#E3F2FD", "#BBDEFB" }
                },
                new()
                {
                    Id = "2",
                    Image = "asset:onboarding2",
                    Title = "Hızlı Rezervasyon",
                    HighlightText = "Rezervasyon",
                    Description = "Kolayca rezervasyon yapın ve güvenli ödeme seçenekleriyle rezervasyonunuzu tamamlayın",
                    BackgroundColor = new List<string> { "#E8F5E9", "#C8E6C9" }
                },
                new()
                {
                    Id = "3",
                    Image = "asset:onboarding3",
                    Title = "Unutulmaz Deneyimler",
                    HighlightText = "Deneyimler",
                    Description = "Profesyonel rehberlerimiz eşliğinde unutulmaz anılar biriktirin",
                    BackgroundColor = new List<string> { "#FFF3E0", "#FFE0B2" }
                }
            };
        }

        private string GetRelativeTime(DateTime date)
        {
            var diff = DateTime.UtcNow - date;
            if (diff.TotalMinutes < 60)
                return $"{(int)diff.TotalMinutes} dakika önce";
            if (diff.TotalHours < 24)
                return $"{(int)diff.TotalHours} saat önce";
            if (diff.TotalDays < 7)
                return $"{(int)diff.TotalDays} gün önce";
            return date.ToString("dd.MM.yyyy");
        }

        private string GetAvatarColor(string? type)
        {
            return type switch
            {
                "success" => "#4CAF50",
                "info" => "#2196F3",
                "warning" => "#FF9800",
                "error" => "#F44336",
                _ => "#9E9E9E"
            };
        }

        private string GetAvatarEmoji(string? type)
        {
            return type switch
            {
                "success" => "✓",
                "info" => "ℹ",
                "warning" => "⚠",
                "error" => "✗",
                _ => "•"
            };
        }
    }
}
