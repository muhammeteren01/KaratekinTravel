using Autofac;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Core.Entities;
using Repository.Repository;
using Service.Service;
using Service.Validations;
using FluentValidation;
using Repository.UnitOfWork;

namespace Api.Autofac
{
    public class DependencyResolverModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            // UnitOfWorks
            builder.RegisterType<UnitOfWork>().As<IUnitOfWork>().InstancePerLifetimeScope();
            
            // Repositories
            builder.RegisterType<CalendarTripRepository>().As<ICalendarTripRepository>().InstancePerLifetimeScope();
            builder.RegisterType<ChatGroupRepository>().As<IChatGroupRepository>().InstancePerLifetimeScope();
            builder.RegisterType<ChatGroupMemberRepository>().As<IChatGroupMemberRepository>().InstancePerLifetimeScope();
            builder.RegisterType<ChatMessageRepository>().As<IChatMessageRepository>().InstancePerLifetimeScope();
            builder.RegisterType<CompanyRepository>().As<ICompanyRepository>().InstancePerLifetimeScope();
            builder.RegisterType<CompanyReviewRepository>().As<ICompanyReviewRepository>().InstancePerLifetimeScope();
            builder.RegisterType<HotelAmenityRepository>().As<IHotelAmenityRepository>().InstancePerLifetimeScope();
            builder.RegisterType<ItineraryActivityRepository>().As<IItineraryActivityRepository>().InstancePerLifetimeScope();
            builder.RegisterType<ReservationRepository>().As<IReservationRepository>().InstancePerLifetimeScope();
            builder.RegisterType<ReviewRepository>().As<IReviewRepository>().InstancePerLifetimeScope();
            builder.RegisterType<TripRepository>().As<ITripRepository>().InstancePerLifetimeScope();
            builder.RegisterType<TripDetailsRepository>().As<ITripDetailsRepository>().InstancePerLifetimeScope();
            builder.RegisterType<TripExcludedRepository>().As<ITripExcludedRepository>().InstancePerLifetimeScope();
            builder.RegisterType<TripGalleryRepository>().As<ITripGalleryRepository>().InstancePerLifetimeScope();
            builder.RegisterType<TripHotelRepository>().As<ITripHotelRepository>().InstancePerLifetimeScope();
            builder.RegisterType<TripIncludedRepository>().As<ITripIncludedRepository>().InstancePerLifetimeScope();
            builder.RegisterType<TripItineraryRepository>().As<ITripItineraryRepository>().InstancePerLifetimeScope();
            builder.RegisterType<TripPolicyRepository>().As<ITripPolicyRepository>().InstancePerLifetimeScope();
            builder.RegisterType<TripPolicyParagraphRepository>().As<ITripPolicyParagraphRepository>().InstancePerLifetimeScope();
            builder.RegisterType<TripPricingRepository>().As<ITripPricingRepository>().InstancePerLifetimeScope();
            builder.RegisterType<TripPricingExtraRepository>().As<ITripPricingExtraRepository>().InstancePerLifetimeScope();
            builder.RegisterType<UserRepository>().As<IUserRepository>().InstancePerLifetimeScope();
            builder.RegisterType<UserNotificationRepository>().As<IUserNotificationRepository>().InstancePerLifetimeScope();
            builder.RegisterType<UserSavedTripRepository>().As<IUserSavedTripRepository>().InstancePerLifetimeScope();
            builder.RegisterType<TripDepartureRepository>().As<ITripDepartureRepository>().InstancePerLifetimeScope();
            builder.RegisterType<VehicleRepository>().As<IVehicleRepository>().InstancePerLifetimeScope();
            builder.RegisterType<SeatLayoutRepository>().As<ISeatLayoutRepository>().InstancePerLifetimeScope();
            builder.RegisterType<CouponRepository>().As<ICouponRepository>().InstancePerLifetimeScope();
            builder.RegisterType<RefundRequestRepository>().As<IRefundRequestRepository>().InstancePerLifetimeScope();
            builder.RegisterType<PaymentRepository>().As<IPaymentRepository>().InstancePerLifetimeScope();
            builder.RegisterType<ReviewReportRepository>().As<IReviewReportRepository>().InstancePerLifetimeScope();
            builder.RegisterType<HotelRepository>().As<IHotelRepository>().InstancePerLifetimeScope();

            // Services
            builder.RegisterType<CalendarTripService>().As<ICalendarTripService>().InstancePerLifetimeScope();
            builder.RegisterType<ChatGroupService>().As<IChatGroupService>().InstancePerLifetimeScope();
            builder.RegisterType<ChatGroupMemberService>().As<IChatGroupMemberService>().InstancePerLifetimeScope();
            builder.RegisterType<ChatMessageService>().As<IChatMessageService>().InstancePerLifetimeScope();
            builder.RegisterType<CompanyService>().As<ICompanyService>().InstancePerLifetimeScope();
            builder.RegisterType<CompanyReviewService>().As<ICompanyReviewService>().InstancePerLifetimeScope();
            builder.RegisterType<HotelAmenityService>().As<IHotelAmenityService>().InstancePerLifetimeScope();
            builder.RegisterType<ItineraryActivityService>().As<IItineraryActivityService>().InstancePerLifetimeScope();
            builder.RegisterType<ReservationService>().As<IReservationService>().InstancePerLifetimeScope();
            builder.RegisterType<ReviewService>().As<IReviewService>().InstancePerLifetimeScope();
            builder.RegisterType<TripService>().As<ITripService>().InstancePerLifetimeScope();
            builder.RegisterType<TripDetailsService>().As<ITripDetailsService>().InstancePerLifetimeScope();
            builder.RegisterType<TripExcludedService>().As<ITripExcludedService>().InstancePerLifetimeScope();
            builder.RegisterType<TripGalleryService>().As<ITripGalleryService>().InstancePerLifetimeScope();
            builder.RegisterType<TripHotelService>().As<ITripHotelService>().InstancePerLifetimeScope();
            builder.RegisterType<TripIncludedService>().As<ITripIncludedService>().InstancePerLifetimeScope();
            builder.RegisterType<TripItineraryService>().As<ITripItineraryService>().InstancePerLifetimeScope();
            builder.RegisterType<TripPolicyService>().As<ITripPolicyService>().InstancePerLifetimeScope();
            builder.RegisterType<TripPolicyParagraphService>().As<ITripPolicyParagraphService>().InstancePerLifetimeScope();
            builder.RegisterType<TripPricingService>().As<ITripPricingService>().InstancePerLifetimeScope();
            builder.RegisterType<TripPricingExtraService>().As<ITripPricingExtraService>().InstancePerLifetimeScope();
            builder.RegisterType<UserService>().As<IUserService>().InstancePerLifetimeScope();
            builder.RegisterType<UserNotificationService>().As<IUserNotificationService>().InstancePerLifetimeScope();
            builder.RegisterType<UserSavedTripService>().As<IUserSavedTripService>().InstancePerLifetimeScope();
            builder.RegisterType<TripDepartureService>().As<ITripDepartureService>().InstancePerLifetimeScope();
            builder.RegisterType<VehicleService>().As<IVehicleService>().InstancePerLifetimeScope();
            builder.RegisterType<CouponService>().As<ICouponService>().InstancePerLifetimeScope();
            builder.RegisterType<RefundService>().As<IRefundService>().InstancePerLifetimeScope();
            builder.RegisterType<PaymentService>().As<IPaymentService>().InstancePerLifetimeScope();
            builder.RegisterType<HotelService>().As<IHotelService>().InstancePerLifetimeScope();
            builder.RegisterType<ReportService>().As<IReportService>().InstancePerLifetimeScope();
            builder.RegisterType<SeatAvailabilityService>().As<ISeatAvailabilityService>().InstancePerLifetimeScope();
            // Bootstrap Service
            builder.RegisterType<BootstrapService>().As<IBootstrapService>().InstancePerLifetimeScope();
            // Generic Repository & Service
            builder.RegisterGeneric(typeof(GenericRepository<>)).As(typeof(IGenericRepository<>)).InstancePerLifetimeScope();
            builder.RegisterGeneric(typeof(Service<>)).As(typeof(IService<>)).InstancePerLifetimeScope();

            // FluentValidation - All Entity Validators
            builder.RegisterType<CalendarTripValidator>().As<IValidator<CalendarTrip>>().InstancePerLifetimeScope();
            builder.RegisterType<ChatGroupValidator>().As<IValidator<ChatGroup>>().InstancePerLifetimeScope();
            builder.RegisterType<ChatGroupMemberValidator>().As<IValidator<ChatGroupMember>>().InstancePerLifetimeScope();
            builder.RegisterType<ChatMessageValidator>().As<IValidator<ChatMessage>>().InstancePerLifetimeScope();
            builder.RegisterType<CompanyValidator>().As<IValidator<Company>>().InstancePerLifetimeScope();
            builder.RegisterType<CompanyReviewValidator>().As<IValidator<CompanyReview>>().InstancePerLifetimeScope();
            builder.RegisterType<HotelAmenityValidator>().As<IValidator<HotelAmenity>>().InstancePerLifetimeScope();
            builder.RegisterType<ItineraryActivityValidator>().As<IValidator<ItineraryActivity>>().InstancePerLifetimeScope();
            builder.RegisterType<ReservationValidator>().As<IValidator<Reservation>>().InstancePerLifetimeScope();
            builder.RegisterType<ReviewValidator>().As<IValidator<Review>>().InstancePerLifetimeScope();
            builder.RegisterType<TripValidator>().As<IValidator<Trip>>().InstancePerLifetimeScope();
            builder.RegisterType<TripDetailsValidator>().As<IValidator<TripDetails>>().InstancePerLifetimeScope();
            builder.RegisterType<TripExcludedValidator>().As<IValidator<TripExcluded>>().InstancePerLifetimeScope();
            builder.RegisterType<TripGalleryValidator>().As<IValidator<TripGallery>>().InstancePerLifetimeScope();
            builder.RegisterType<TripHotelValidator>().As<IValidator<TripHotel>>().InstancePerLifetimeScope();
            builder.RegisterType<TripIncludedValidator>().As<IValidator<TripIncluded>>().InstancePerLifetimeScope();
            builder.RegisterType<TripItineraryValidator>().As<IValidator<TripItinerary>>().InstancePerLifetimeScope();
            builder.RegisterType<TripPolicyValidator>().As<IValidator<TripPolicy>>().InstancePerLifetimeScope();
            builder.RegisterType<TripPolicyParagraphValidator>().As<IValidator<TripPolicyParagraph>>().InstancePerLifetimeScope();
            builder.RegisterType<TripPricingValidator>().As<IValidator<TripPricing>>().InstancePerLifetimeScope();
            builder.RegisterType<TripPricingExtraValidator>().As<IValidator<TripPricingExtra>>().InstancePerLifetimeScope();
            builder.RegisterType<UserValidator>().As<IValidator<User>>().InstancePerLifetimeScope();
            builder.RegisterType<UserNotificationValidator>().As<IValidator<UserNotification>>().InstancePerLifetimeScope();
            builder.RegisterType<UserSavedTripValidator>().As<IValidator<UserSavedTrip>>().InstancePerLifetimeScope();
        }
    }
}
