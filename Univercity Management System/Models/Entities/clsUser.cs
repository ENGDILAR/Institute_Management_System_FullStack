
namespace Lpgin2.Models.Entities
{
    public class clsUser
    {
       
        public int id { set; get; }
        public required string Email { set; get; }
        public required string PasswordHash { set; get; }
        public Enums.enUserRoles role { set; get; }

        public clsInstructor? Instructor { get; set; }
        public clsAdmin? Admin { get; set; }

        public clsStudent? student { get; set; }

        public string? RefreshTokenHash { get; set; } = string.Empty;
        public DateTime? RefreshTokenExpiresAt { get; set; }
        public DateTime? RefreshTokenRevokedAt { get; set; }

    }
}
