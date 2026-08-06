using AutoMapper;
using Core.Entities;
using Core.DTOs.Chat;
using Core.DTOs.User;
using Core.DTOs.Trip;
using Core.DTOs.Reservation;
using Core.DTOs.Company;
using Core.DTOs.Review;
using Core.DTOs.TripDetails;
using Core.DTOs.Gallery;
using Core.DTOs.TripItenarary;
using Core.DTOs.TripHotel;
using Core.DTOs.CalendarTrip;
using Core.DTOs.Notification;

namespace Core.Mappings
{
    public class MapProfile : Profile
    {
        public MapProfile()
        {
            // Basic DTO mappings - most mapping is done manually in services
            CreateMap<ChatMessage, ChatMessageDto>().ReverseMap();
            CreateMap<User, UserDto>().ReverseMap();
            CreateMap<Trip, TripDto>().ReverseMap();
            CreateMap<Reservation, ReservationDto>().ReverseMap();
            CreateMap<Company, CompanyDto>().ReverseMap();
            CreateMap<CompanyReview, CompanyReviewDto>().ReverseMap();
            CreateMap<ChatGroup, ChatGroupDto>().ReverseMap();
            CreateMap<CalendarTrip, CalendarTripDto>().ReverseMap();
        }
    }
}