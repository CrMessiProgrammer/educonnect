using EduConnect.Domain.Entities;
using Xunit;

namespace EduConnect.Tests
{
    public class AlunoTests
    {
        [Fact]
        public void NovoAluno_DeveEstarAtivoPorPadrao()
        {
            // Testa se um aluno recém-criado já vem como ativo
            var aluno = new Aluno { Nome = "Joãozinho" };

            Assert.True(aluno.Ativo); // Verifica se a propriedade 'Ativo' é verdadeira
        }
    }
}