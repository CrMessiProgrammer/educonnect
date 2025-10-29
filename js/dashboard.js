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
        contentArea.innerHTML = `
            <h2>Gestão de Alunos</h2>
            <p>Aqui você poderá cadastrar, listar e editar alunos.</p>
        `;
        break;
        case "professores":
        contentArea.innerHTML = `
            <h2>Gestão de Professores</h2>
            <p>Aqui você poderá cadastrar e listar professores.</p>
        `;
        break;
        case "calendario":
        contentArea.innerHTML = `
            <h2>Calendário Escolar</h2>
            <p>Visualize eventos e atividades programadas.</p>
        `;
        break;
        case "relatorios":
        contentArea.innerHTML = `
            <h2>Relatórios</h2>
            <p>Gráficos e desempenho geral dos alunos.</p>
        `;
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