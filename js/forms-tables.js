/* forms-tables.js
   - gerencia formulários e tabelas (mock)
   - comentários curtos para explicar o fluxo
*/

// mocks de dados
const alunos = [
  { nome: "João Silva", turma: "1ºA", email: "joao@educonnect.com" },
  { nome: "Maria Souza", turma: "2ºB", email: "maria@educonnect.com" },
  { nome: "Lucas Pereira", turma: "3ºA", email: "lucas@educonnect.com" },
];

const professores = [
  { nome: "Fernanda Lima", materia: "Matemática", email: "fernanda@educonnect.com" },
  { nome: "Carlos Santos", materia: "História", email: "carlos@educonnect.com" },
];

// renderiza formulário/tabela dependendo do tipo
function renderFormularioETabela(tipo) {
  const contentArea = document.getElementById("contentArea");
  const titulo = tipo === "alunos" ? "Gestão de Alunos" : "Gestão de Professores";
  const labelCampoExtra = tipo === "alunos" ? "Turma" : "Matéria";

  contentArea.innerHTML = `
    <section class="form-section">
      <h3>${titulo}</h3>
      <form id="formCadastro">
        <label>Nome</label>
        <input type="text" id="nome" placeholder="Digite o nome completo" />

        <label>${labelCampoExtra}</label>
        <input type="text" id="campoExtra" placeholder="Digite ${labelCampoExtra.toLowerCase()}" />

        <label>Email</label>
        <input type="email" id="email" placeholder="exemplo@educonnect.com" />

        <button type="submit">Cadastrar</button>
      </form>
      <p id="mensagem" style="margin-top:10px;"></p>
    </section>

    <section class="table-section">
      <h3>Lista de ${titulo}</h3>
      <input type="text" id="filtro" placeholder="Filtrar por nome..." />
      <table id="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>${labelCampoExtra}</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          ${gerarLinhasTabela(tipo)}
        </tbody>
      </table>
    </section>
  `;

  // attach events
  const form = document.getElementById("formCadastro");
  const filtro = document.getElementById("filtro");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    cadastrarItem(tipo);
  });
  if (filtro) filtro.addEventListener("input", e => filtrarTabela(tipo, e.target.value.toLowerCase()));
}

function gerarLinhasTabela(tipo) {
  const lista = tipo === "alunos" ? alunos : professores;
  return lista.map(item => `
    <tr>
      <td>${item.nome}</td>
      <td>${tipo === "alunos" ? item.turma : item.materia}</td>
      <td>${item.email}</td>
    </tr>
  `).join("");
}

function cadastrarItem(tipo) {
  const nome = document.getElementById("nome").value.trim();
  const campoExtra = document.getElementById("campoExtra").value.trim();
  const email = document.getElementById("email").value.trim();
  const msg = document.getElementById("mensagem");

  if (!nome || !campoExtra || !email) {
    msg.textContent = "Por favor, preencha todos os campos.";
    msg.style.color = "#e74c3c";
    return;
  }

  const novoItem = tipo === "alunos"
    ? { nome, turma: campoExtra, email }
    : { nome, materia: campoExtra, email };

  (tipo === "alunos" ? alunos : professores).push(novoItem);

  msg.textContent = `${tipo === "alunos" ? "Aluno" : "Professor"} cadastrado com sucesso!`;
  msg.style.color = "#2ecc71";

  const tbody = document.querySelector("#tabela tbody");
  if (tbody) tbody.innerHTML = gerarLinhasTabela(tipo);

  document.getElementById("formCadastro").reset();
}

function filtrarTabela(tipo, valor) {
  const linhas = document.querySelectorAll("#tabela tbody tr");
  linhas.forEach(linha => {
    const nome = linha.children[0].textContent.toLowerCase();
    linha.style.display = nome.includes(valor) ? "" : "none";
  });
}