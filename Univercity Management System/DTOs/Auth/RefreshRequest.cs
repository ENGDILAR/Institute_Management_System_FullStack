namespace Lpgin2.DTOs.Auth
{
    public class RefreshRequest
    {
        public required string RefreshToken { get; set; }
        public required string Email { get; set; }
    }
}
