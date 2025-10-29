// Alternância de tema (claro/escuro)
const themeSwitch = document.getElementById("themeSwitch");
const themeText = document.getElementById("themeText");

// Verifica se o usuário já tem um tema salvo
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeSwitch.checked = true;
  themeText.textContent = "Modo Escuro";
}

// Troca o tema quando o switch é alterado
themeSwitch.addEventListener("change", () => {
  document.body.classList.toggle("dark");
  const currentTheme = document.body.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", currentTheme);
  themeText.textContent = currentTheme === "dark" ? "🌙 Modo Escuro" : "☀️ Modo Claro";
});

// Validação simples de login (apenas simulação)
const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const user = document.getElementById("user").value.trim();
  const password = document.getElementById("password").value.trim();

  // Validação básica só pra testar o comportamento
  if (!user || !password) {
    errorMsg.textContent = "Por favor, preencha todos os campos.";
    return;
  }

  // Aqui futuramente será feita a autenticação real
  errorMsg.textContent = "";
  alert("Login realizado com sucesso!");
  // window.location.href = "dashboard.html"; // deixo comentado por enquanto
});