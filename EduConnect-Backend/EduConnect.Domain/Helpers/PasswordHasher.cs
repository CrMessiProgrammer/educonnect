namespace EduConnect.Domain.Helpers;

public static class PasswordHasher
{
    // Transforma a senha em Hash
    public static string HashPassword(string password) =>
        BCrypt.Net.BCrypt.HashPassword(password);

    // Verifica se a senha bate com o Hash (usaremos no login)
    public static bool VerifyPassword(string password, string hash) =>
        BCrypt.Net.BCrypt.Verify(password, hash);
}