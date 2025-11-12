// Controle de tema (claro/escuro)
const themeSwitch = document.getElementById("themeSwitch");
const themeText = document.getElementById("themeText");

// Verifica se o usuário já tinha um tema salvo anteriormente
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeSwitch.checked = true;
  themeText.textContent = "🌙 Modo Escuro";
}

// Alterna o tema e salva no localStorage
themeSwitch.addEventListener("change", () => {
  document.body.classList.toggle("dark");
  const currentTheme = document.body.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", currentTheme);
  themeText.textContent = currentTheme === "dark" ? "🌙 Modo Escuro" : "☀️ Modo Claro";
});

// Simulação simples de login (sem backend por enquanto)
const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const user = document.getElementById("user").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!user || !password) {
    errorMsg.textContent = "Por favor, preencha todos os campos.";
    return;
  }

  // Aqui futuramente virá a autenticação real (API)
  errorMsg.textContent = "";
  alert("Login realizado com sucesso!");
  // window.location.href = "dashboard.html"; // Mantido comentado por enquanto
});