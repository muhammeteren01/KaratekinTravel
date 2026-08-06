using Core.Entities;
using Core.Enums;
using FluentAssertions;
using Service.Validations;

namespace Api.UnitTests.Validations;

public class ChatCalendarAndUserRelatedValidatorTests
{
    [Fact]
    public void ChatGroup_valid_passes()
    {
        new ChatGroupValidator().Validate(new ChatGroup
        {
            GroupName = "Kapadokya Grubu",
            TripId = Guid.NewGuid()
        }).IsValid.Should().BeTrue();
    }

    [Fact]
    public void ChatGroup_short_name_fails()
    {
        new ChatGroupValidator().Validate(new ChatGroup
        {
            GroupName = "A",
            TripId = Guid.NewGuid()
        }).IsValid.Should().BeFalse();
    }

    [Fact]
    public void ChatMember_valid_passes()
    {
        new ChatGroupMemberValidator().Validate(new ChatGroupMember
        {
            GroupId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Role = "member"
        }).IsValid.Should().BeTrue();
    }

    [Fact]
    public void ChatMessage_valid_passes()
    {
        new ChatMessageValidator().Validate(new ChatMessage
        {
            GroupId = Guid.NewGuid(),
            SenderId = Guid.NewGuid(),
            Text = "Merhaba"
        }).IsValid.Should().BeTrue();
    }

    [Fact]
    public void ChatMessage_empty_text_fails()
    {
        new ChatMessageValidator().Validate(new ChatMessage
        {
            GroupId = Guid.NewGuid(),
            SenderId = Guid.NewGuid(),
            Text = ""
        }).IsValid.Should().BeFalse();
    }

    [Fact]
    public void Calendar_future_date_passes()
    {
        new CalendarTripValidator().Validate(new CalendarTrip
        {
            Date = DateTime.Now.AddDays(2),
            Status = CalendarStatus.ACTIVE
        }).IsValid.Should().BeTrue();
    }

    [Fact]
    public void Calendar_past_date_fails()
    {
        new CalendarTripValidator().Validate(new CalendarTrip
        {
            Date = DateTime.Now.AddDays(-5),
            Status = CalendarStatus.ACTIVE
        }).IsValid.Should().BeFalse();
    }

    [Fact]
    public void UserNotification_valid_passes()
    {
        new UserNotificationValidator().Validate(new UserNotification
        {
            UserId = Guid.NewGuid(),
            Title = "Rezervasyon",
            Message = "Rezervasyonunuz onaylandı",
            Type = "reservation"
        }).IsValid.Should().BeTrue();
    }

    [Fact]
    public void UserNotification_missing_fields_fail()
    {
        new UserNotificationValidator().Validate(new UserNotification
        {
            UserId = Guid.Empty,
            Title = "",
            Message = "",
            Type = ""
        }).IsValid.Should().BeFalse();
    }

    [Fact]
    public void UserSavedTrip_valid_passes()
    {
        new UserSavedTripValidator().Validate(new UserSavedTrip
        {
            UserId = Guid.NewGuid(),
            TripId = Guid.NewGuid()
        }).IsValid.Should().BeTrue();
    }

    [Fact]
    public void UserSavedTrip_empty_ids_fail()
    {
        new UserSavedTripValidator().Validate(new UserSavedTrip
        {
            UserId = Guid.Empty,
            TripId = Guid.Empty
        }).IsValid.Should().BeFalse();
    }
}
