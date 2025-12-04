/* main.js
   Comentários no estilo humano (curtos) explicando o que foi feito.
   - Controle de tema
   - Login simulado com roles
   - Esqueci senha (modal)
*/

// Theme control (shared between login and dashboard)
const themeSwitch = document.getElementById("themeSwitch");
const themeText = document.getElementById("themeText");
const themeSwitchTop = document.getElementById("themeSwitchTop");
const themeTextTop = document.getElementById("themeTextTop");

// Apply saved theme (if any)
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  if (themeSwitch) themeSwitch.checked = true;
  if (themeSwitchTop) themeSwitchTop.checked = true;
  if (themeText) themeText.textContent = "🌙 Modo Escuro";
  if (themeTextTop) themeTextTop.textContent = "🌙 Modo Escuro";
}

// Helper to toggle theme (keeps texts in sync)
function toggleTheme(fromTop = false) {
  document.body.classList.toggle("dark");
  const currentTheme = document.body.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", currentTheme);

  const label = currentTheme === "dark" ? "🌙 Modo Escuro" : "☀️ Modo Claro";
  if (themeText) themeText.textContent = label;
  if (themeTextTop) themeTextTop.textContent = label;
  if (themeSwitch) themeSwitch.checked = currentTheme === "dark";
  if (themeSwitchTop) themeSwitchTop.checked = currentTheme === "dark";
}

if (themeSwitch) themeSwitch.addEventListener("change", () => toggleTheme(false));
if (themeSwitchTop) themeSwitchTop.addEventListener("change", () => toggleTheme(true));

// ---------- Login logic (front-side simulation) ----------
const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

// Elements for forgot password modal
const forgotLink = document.getElementById("forgotLink");
const forgotModal = document.getElementById("forgotModal");
const forgotClose = document.getElementById("forgotClose");
const forgotSend = document.getElementById("forgotSend");
const forgotEmail = document.getElementById("forgotEmail");
const forgotMsg = document.getElementById("forgotMsg");

// Simple helper to show notification (reuses interactivity.js function if present)
function criarNotificacaoLocal(texto, isEvento = false) {
  if (typeof criarNotificacao === "function") {
    criarNotificacao(texto, isEvento);
    return;
  }
  // fallback simple alert
  console.log("notificação:", texto);
}

// Open modal
if (forgotLink) {
  forgotLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (forgotModal) {
      forgotModal.setAttribute("aria-hidden", "false");
      forgotEmail.value = "";
      forgotMsg.textContent = "";
      forgotEmail.focus();
    }
  });
}

// Close modal
if (forgotClose) forgotClose.addEventListener("click", () => {
  if (forgotModal) forgotModal.setAttribute("aria-hidden", "true");
});

// Send (simulate)
if (forgotSend) {
  forgotSend.addEventListener("click", () => {
    const email = forgotEmail.value.trim();
    if (!email || !email.includes("@")) {
      forgotMsg.textContent = "Por favor, digite um e-mail válido.";
      forgotMsg.style.color = "#e74c3c";
      return;
    }
    // simulação de envio
    forgotMsg.textContent = "Enviado! Verifique seu e-mail (simulação).";
    forgotMsg.style.color = "#2ecc71";
    criarNotificacaoLocal("E-mail de recuperação enviado (simulação).", true);
    setTimeout(() => {
      if (forgotModal) forgotModal.setAttribute("aria-hidden", "true");
    }, 1200);
  });
}

// Basic front validation and simulated login
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const user = document.getElementById("user").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value; // student / teacher / admin

    // Friendly validations (front)
    if (!user || !password) {
      errorMsg.textContent = "Por favor, preencha todos os campos.";
      return;
    }

    if (password.length < 4) {
      errorMsg.textContent = "Senha muito curta (mínimo 4 caracteres).";
      return;
    }

    // Simular autenticação: aceitamos qualquer credencial válida (front) — mas guardamos role
    errorMsg.textContent = "";

    // Guardar dados para o Dashboard (simulação)
    const displayName = user.split("@")[0] || user;
    localStorage.setItem("userName", displayName);
    localStorage.setItem("userRole", role);

    criarNotificacaoLocal("Login realizado com sucesso!", false);

    // redireciona para dashboard
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 300);
  });
}

// Accessibility: close modal with ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && forgotModal && forgotModal.getAttribute("aria-hidden") === "false") {
    forgotModal.setAttribute("aria-hidden", "true");
  }
});