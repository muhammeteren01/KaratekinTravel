using Core.Entities;
using FluentAssertions;
using Service.Validations;

namespace Api.UnitTests.Validations;

public class CompanyAndReviewValidatorTests
{
    [Fact]
    public void Company_valid_passes()
    {
        var result = new CompanyValidator().Validate(new Company
        {
            Name = "Karatekin Travel",
            Rating = 8.5m,
            ReviewCount = 12,
            Location = "Ankara"
        });
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("A")]
    public void Company_name_invalid_fails(string name)
    {
        new CompanyValidator().Validate(new Company { Name = name }).IsValid.Should().BeFalse();
    }

    [Theory]
    [InlineData(-0.1)]
    [InlineData(10.1)]
    public void Company_rating_out_of_range_fails(double rating)
    {
        new CompanyValidator().Validate(new Company
        {
            Name = "ACME",
            Rating = (decimal)rating
        }).IsValid.Should().BeFalse();
    }

    [Fact]
    public void CompanyReview_valid_passes()
    {
        new CompanyReviewValidator().Validate(new CompanyReview
        {
            CompanyId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            TripName = "Kapadokya",
            Rating = 5,
            Comment = "Harika bir turdu."
        }).IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    public void CompanyReview_rating_out_of_range_fails(int rating)
    {
        new CompanyReviewValidator().Validate(new CompanyReview
        {
            CompanyId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            TripName = "Tur",
            Rating = rating
        }).IsValid.Should().BeFalse();
    }

    [Fact]
    public void Review_valid_passes()
    {
        new ReviewValidator().Validate(new Review
        {
            TripId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Rating = 4,
            Comment = "En az on karakterlik yorum"
        }).IsValid.Should().BeTrue();
    }

    [Fact]
    public void Review_short_comment_fails()
    {
        new ReviewValidator().Validate(new Review
        {
            TripId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Rating = 4,
            Comment = "kısa"
        }).IsValid.Should().BeFalse();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    public void Review_rating_out_of_range_fails(int rating)
    {
        new ReviewValidator().Validate(new Review
        {
            TripId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Rating = rating
        }).IsValid.Should().BeFalse();
    }
}
