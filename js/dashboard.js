// Controle principal do dashboard

const menuItems = document.querySelectorAll(".sidebar nav li");
const contentArea = document.getElementById("contentArea");
const logoutBtn = document.getElementById("logoutBtn");

// Alterna entre as seções ao clicar no menu lateral
menuItems.forEach(item => {
    item.addEventListener("click", () => {
        menuItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        const section = item.getAttribute("data-section");
        atualizarConteudo(section);
    });
});

// Atualiza o conteúdo da área principal conforme a seção clicada
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

// Logout simples com confirmação
logoutBtn.addEventListener("click", () => {
    if (confirm("Deseja realmente sair?")) {
        window.location.href = "index.html";
    }
});