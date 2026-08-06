using FluentAssertions;

namespace Api.UnitTests;

public class AuthPasswordTests
{
    [Fact]
    public void HashPassword_CanBeVerified()
    {
        const string password = "Secret123!";
        var hash = BCrypt.Net.BCrypt.HashPassword(password);

        hash.Should().NotBeNullOrWhiteSpace();
        hash.Should().NotBe(password);
        BCrypt.Net.BCrypt.Verify(password, hash).Should().BeTrue();
    }

    [Fact]
    public void Verify_Fails_ForWrongPassword()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("Correct#Pass");
        BCrypt.Net.BCrypt.Verify("WrongPass", hash).Should().BeFalse();
    }

    [Fact]
    public void Different_salts_produce_different_hashes()
    {
        const string password = "SamePassword!";
        var hash1 = BCrypt.Net.BCrypt.HashPassword(password);
        var hash2 = BCrypt.Net.BCrypt.HashPassword(password);

        hash1.Should().NotBe(hash2);
        BCrypt.Net.BCrypt.Verify(password, hash1).Should().BeTrue();
        BCrypt.Net.BCrypt.Verify(password, hash2).Should().BeTrue();
    }
}
