using MailKit.Net.Smtp;
using MimeKit;

namespace EduConnect.Application.Services;

public class EmailService
{
    public async Task EnviarEmailAsync(string destino, string assunto, string mensagemHtml)
    {
        var email = new MimeMessage();
        email.From.Add(new MailboxAddress("EduConnect", "sistema@educonnect.com"));
        email.To.Add(MailboxAddress.Parse(destino ?? "email_teste@educonnect.com")); // Fallback se e-mail for nulo
        email.Subject = assunto;
        email.Body = new TextPart("html") { Text = mensagemHtml };

        using var smtp = new SmtpClient();
        // CONFIGURAÇÃO SMTP (Ethereal)
        await smtp.ConnectAsync("smtp.ethereal.email", 587, MailKit.Security.SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync("doris55@ethereal.email", "JRk8NG2KF7N6xBXFfF");
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}