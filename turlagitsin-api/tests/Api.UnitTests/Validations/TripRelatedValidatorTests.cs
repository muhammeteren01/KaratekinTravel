using Core.Entities;
using FluentAssertions;
using Service.Validations;

namespace Api.UnitTests.Validations;

public class TripRelatedValidatorTests
{
    [Fact]
    public void Pricing_valid_passes()
    {
        new TripPricingValidator().Validate(new TripPricing
        {
            TripId = Guid.NewGuid(),
            Currency = "TRY",
            BasePrice = 5000,
            DiscountAmount = 500
        }).IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("BTC")]
    [InlineData("")]
    public void Pricing_invalid_currency_fails(string currency)
    {
        new TripPricingValidator().Validate(new TripPricing
        {
            TripId = Guid.NewGuid(),
            Currency = currency,
            BasePrice = 100
        }).IsValid.Should().BeFalse();
    }

    [Fact]
    public void Pricing_discount_gte_base_fails()
    {
        new TripPricingValidator().Validate(new TripPricing
        {
            TripId = Guid.NewGuid(),
            Currency = "USD",
            BasePrice = 100,
            DiscountAmount = 100
        }).IsValid.Should().BeFalse();
    }

    [Fact]
    public void PricingExtra_valid_passes()
    {
        new TripPricingExtraValidator().Validate(new TripPricingExtra
        {
            PricingId = Guid.NewGuid(),
            Label = "Tek kişilik oda",
            Amount = 750,
            DisplayOrder = 0
        }).IsValid.Should().BeTrue();
    }

    [Fact]
    public void Gallery_valid_passes()
    {
        new TripGalleryValidator().Validate(new TripGallery
        {
            TripId = Guid.NewGuid(),
            ImageUrl = "https://cdn.example.com/a.jpg",
            DisplayOrder = 1
        }).IsValid.Should().BeTrue();
    }

    [Fact]
    public void Gallery_empty_url_fails()
    {
        new TripGalleryValidator().Validate(new TripGallery
        {
            TripId = Guid.NewGuid(),
            ImageUrl = "",
            DisplayOrder = 0
        }).IsValid.Should().BeFalse();
    }

    [Fact]
    public void Hotel_valid_passes()
    {
        new TripHotelValidator().Validate(new TripHotel
        {
            TripId = Guid.NewGuid(),
            Name = "Grand Hotel",
            Stars = 4,
            Phone = "05321112233",
            DisplayOrder = 0
        }).IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(6)]
    public void Hotel_stars_out_of_range_fails(int stars)
    {
        new TripHotelValidator().Validate(new TripHotel
        {
            TripId = Guid.NewGuid(),
            Name = "Hotel",
            Stars = stars
        }).IsValid.Should().BeFalse();
    }

    [Fact]
    public void Itinerary_valid_passes()
    {
        new TripItineraryValidator().Validate(new TripItinerary
        {
            TripId = Guid.NewGuid(),
            Day = 1,
            Title = "Günübirlik",
            DisplayOrder = 0
        }).IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(366)]
    public void Itinerary_day_out_of_range_fails(int day)
    {
        new TripItineraryValidator().Validate(new TripItinerary
        {
            TripId = Guid.NewGuid(),
            Day = day,
            Title = "Program"
        }).IsValid.Should().BeFalse();
    }

    [Fact]
    public void Activity_valid_passes()
    {
        new ItineraryActivityValidator().Validate(new ItineraryActivity
        {
            ItineraryId = Guid.NewGuid(),
            Time = "09:30",
            Label = "Kalkış",
            DisplayOrder = 0
        }).IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("9:30")]
    [InlineData("25:00")]
    [InlineData("abc")]
    public void Activity_invalid_time_fails(string time)
    {
        // "9:30" is actually valid per regex ([0-1]?[0-9]|2[0-3]):[0-5][0-9]
        // use clearly invalid ones except test may need adjustment
        if (time == "9:30")
        {
            new ItineraryActivityValidator().Validate(new ItineraryActivity
            {
                ItineraryId = Guid.NewGuid(),
                Time = time,
                Label = "Kalkış"
            }).IsValid.Should().BeTrue();
            return;
        }

        new ItineraryActivityValidator().Validate(new ItineraryActivity
        {
            ItineraryId = Guid.NewGuid(),
            Time = time,
            Label = "Kalkış"
        }).IsValid.Should().BeFalse();
    }

    [Fact]
    public void Details_Included_Excluded_Policy_pass()
    {
        var tripId = Guid.NewGuid();
        var detailsId = Guid.NewGuid();
        var policyId = Guid.NewGuid();

        new TripDetailsValidator().Validate(new TripDetails { TripId = tripId }).IsValid.Should().BeTrue();
        new TripIncludedValidator().Validate(new TripIncluded
        {
            DetailsId = detailsId,
            Item = "Kahvaltı",
            DisplayOrder = 0
        }).IsValid.Should().BeTrue();
        new TripExcludedValidator().Validate(new TripExcluded
        {
            DetailsId = detailsId,
            Item = "Öğle yemeği",
            DisplayOrder = 0
        }).IsValid.Should().BeTrue();
        new TripPolicyValidator().Validate(new TripPolicy { TripId = tripId }).IsValid.Should().BeTrue();
        new TripPolicyParagraphValidator().Validate(new TripPolicyParagraph
        {
            PolicyId = policyId,
            Content = "En az on karakterlik politika metni",
            DisplayOrder = 0
        }).IsValid.Should().BeTrue();
    }

    [Fact]
    public void Included_short_item_fails()
    {
        new TripIncludedValidator().Validate(new TripIncluded
        {
            DetailsId = Guid.NewGuid(),
            Item = "ab"
        }).IsValid.Should().BeFalse();
    }

    [Fact]
    public void PolicyParagraph_short_content_fails()
    {
        new TripPolicyParagraphValidator().Validate(new TripPolicyParagraph
        {
            PolicyId = Guid.NewGuid(),
            Content = "kısa"
        }).IsValid.Should().BeFalse();
    }

    [Fact]
    public void HotelAmenity_valid_passes()
    {
        new HotelAmenityValidator().Validate(new HotelAmenity
        {
            HotelId = Guid.NewGuid(),
            Name = "Wi-Fi",
            DisplayOrder = 0
        }).IsValid.Should().BeTrue();
    }

    [Fact]
    public void Negative_display_order_fails_on_gallery()
    {
        new TripGalleryValidator().Validate(new TripGallery
        {
            TripId = Guid.NewGuid(),
            ImageUrl = "https://x.com/a.jpg",
            DisplayOrder = -1
        }).IsValid.Should().BeFalse();
    }
}
