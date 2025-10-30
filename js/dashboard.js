// Script da dashboard

const menuItems = document.querySelectorAll(".sidebar nav li");
const contentArea = document.getElementById("contentArea");
const logoutBtn = document.getElementById("logoutBtn");

// Troca de seções ao clicar no menu
menuItems.forEach(item => {
    item.addEventListener("click", () => {
        menuItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        const section = item.getAttribute("data-section");
        atualizarConteudo(section);
    });
});

// Função para trocar o conteúdo principal
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

// Botão de logout
logoutBtn.addEventListener("click", () => {
    if (confirm("Deseja realmente sair?")) {
        window.location.href = "index.html";
    }
});