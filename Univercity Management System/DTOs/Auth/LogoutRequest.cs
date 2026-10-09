namespace Lpgin2.DTOs.Auth
{
    public class LogoutRequest
    {
        public required string Email { get; set; }
        public required string RefreshToken { get; set; }
    }
}
