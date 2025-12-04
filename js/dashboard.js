/* dashboard.js
   - carrega userName / userRole
   - controla menu e seções
   - logout (desktop + mobile)
*/

// Menu items and content area
const menuItems = document.querySelectorAll(".sidebar nav li");
const contentArea = document.getElementById("contentArea");
const logoutBtn = document.getElementById("logoutBtn");
const logoutMobile = document.getElementById("logoutMobile");

// load user data from localStorage
const storedName = localStorage.getItem("userName") || "Usuário";
const storedRole = localStorage.getItem("userRole") || "student";

const userNameEl = document.getElementById("userName");
const userRoleEl = document.getElementById("userRole");

// display name and role
if (userNameEl) userNameEl.textContent = `Olá, ${storedName}!`;
if (userRoleEl) {
  const roleLabel = storedRole === "admin" ? "Administrador" : storedRole === "teacher" ? "Professor" : "Aluno";
  userRoleEl.textContent = `— ${roleLabel}`;
}

// Adjust menu visibility based on role (example)
function adjustMenuByRole(role) {
  // If student, hide Relatórios menu
  const rel = document.querySelector('[data-section="relatorios"]');
  if (rel) {
    if (role === "student") rel.style.display = "none";
    else rel.style.display = "";
  }
}
adjustMenuByRole(storedRole);

// Menu interactions
menuItems.forEach(item => {
  item.addEventListener("click", () => {
    menuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    const section = item.getAttribute("data-section");
    atualizarConteudo(section);
  });
});

// Update content area
function atualizarConteudo(secao) {
  switch (secao) {
    case "alunos":
      renderFormularioETabela("alunos");
      break;
    case "professores":
      renderFormularioETabela("professores");
      break;
    case "relatorios":
      renderGraficoDesempenho();
      break;
    case "calendario":
      renderCalendario();
      break;
    default:
      contentArea.innerHTML = `
        <h2>Bem-vindo ao Painel</h2>
        <p>Selecione uma das seções no menu para começar.</p>
      `;
  }
}

// logout (sidebar)
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    if (confirm("Deseja realmente sair?")) {
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      window.location.href = "index.html";
    }
  });
}

// logout (mobile topbar)
if (logoutMobile) {
  logoutMobile.addEventListener("click", () => {
    if (confirm("Deseja realmente sair?")) {
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      window.location.href = "index.html";
    }
  });
}

// initial content (keep active selection)
document.addEventListener("DOMContentLoaded", () => {
  const active = document.querySelector(".sidebar nav li.active");
  const section = active ? active.getAttribute("data-section") : "alunos";
  atualizarConteudo(section);
});