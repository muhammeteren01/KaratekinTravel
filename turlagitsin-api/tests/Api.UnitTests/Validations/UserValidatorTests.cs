using Core.Entities;
using FluentAssertions;
using Service.Validations;

namespace Api.UnitTests.Validations;

public class UserValidatorTests
{
    private readonly UserValidator _sut = new();

    private static User ValidUser() => new()
    {
        Name = "Ali Veli",
        Email = "ali@example.com",
        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Secret123!"),
        Phone = "+90 532 111 2233"
    };

    [Fact]
    public void Valid_user_passes()
    {
        _sut.Validate(ValidUser()).IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("A")]
    public void Name_invalid_fails(string name)
    {
        var user = ValidUser();
        user.Name = name;
        _sut.Validate(user).IsValid.Should().BeFalse();
    }

    [Theory]
    [InlineData("")]
    [InlineData("not-an-email")]
    [InlineData("a@b")]
    public void Email_invalid_fails(string email)
    {
        var user = ValidUser();
        user.Email = email;
        _sut.Validate(user).IsValid.Should().BeFalse();
    }

    [Fact]
    public void Empty_password_hash_fails()
    {
        var user = ValidUser();
        user.PasswordHash = "";
        _sut.Validate(user).IsValid.Should().BeFalse();
    }

    [Theory]
    [InlineData("123")]
    [InlineData("abc-def")]
    public void Phone_too_short_or_invalid_fails(string phone)
    {
        var user = ValidUser();
        user.Phone = phone;
        _sut.Validate(user).IsValid.Should().BeFalse();
    }

    [Fact]
    public void Null_phone_is_allowed()
    {
        var user = ValidUser();
        user.Phone = null;
        _sut.Validate(user).IsValid.Should().BeTrue();
    }
}
