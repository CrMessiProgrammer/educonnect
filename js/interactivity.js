// === Sistema de Notificações ===
function criarNotificacao(texto) {
  const container = document.querySelector(".notification-container") || criarContainerNotificacoes();
  const notif = document.createElement("div");
  notif.classList.add("notification");
  notif.textContent = texto;

  container.appendChild(notif);

  // Remove a notificação automaticamente após 3 segundos
  setTimeout(() => notif.remove(), 3000);
}

function criarContainerNotificacoes() {
  const container = document.createElement("div");
  container.classList.add("notification-container");
  document.body.appendChild(container);
  return container;
}

// === Gráfico de Desempenho (Chart.js) ===
function renderGraficoDesempenho() {
  const contentArea = document.getElementById("contentArea");
  contentArea.innerHTML = `
    <section class="chart-section">
      <h3>Gráfico de Desempenho</h3>
      <canvas id="graficoDesempenho"></canvas>
    </section>
  `;

  const ctx = document.getElementById("graficoDesempenho").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Português", "Matemática", "História", "Geografia", "Ciências"],
      datasets: [{
        label: "Média de notas",
        data: [8.2, 7.5, 9.0, 6.8, 8.7],
        backgroundColor: [
          "rgba(74, 144, 226, 0.8)",
          "rgba(80, 227, 194, 0.8)",
          "rgba(245, 166, 35, 0.8)",
          "rgba(144, 19, 254, 0.8)",
          "rgba(184, 233, 134, 0.8)"
        ],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.7)",
          titleFont: { weight: "bold" }
        }
      }
    }
  });
}

// === Calendário Interativo ===
function renderCalendario() {
  const contentArea = document.getElementById("contentArea");
  contentArea.innerHTML = `
    <section class="calendar-section">
      <div class="calendar-header">
        <button id="prevMonth">&lt;</button>
        <h3 id="monthYear"></h3>
        <button id="nextMonth">&gt;</button>
      </div>
      <div class="calendar-grid" id="calendarGrid"></div>
    </section>
  `;

  const mesAno = document.getElementById("monthYear");
  const grid = document.getElementById("calendarGrid");
  let dataAtual = new Date();

  function atualizarCalendario() {
    grid.innerHTML = "";
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();

    mesAno.textContent = dataAtual.toLocaleString("pt-BR", { month: "long", year: "numeric" });

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();

    // Preenche dias anteriores
    for (let i = 0; i < primeiroDia; i++) {
      grid.appendChild(document.createElement("div"));
    }

    // Cria os dias do mês
    for (let dia = 1; dia <= ultimoDia; dia++) {
      const div = document.createElement("div");
      div.classList.add("calendar-day");
      div.textContent = dia;

      const hoje = new Date();
      if (
        dia === hoje.getDate() &&
        mes === hoje.getMonth() &&
        ano === hoje.getFullYear()
      ) {
        div.classList.add("today");
      }

      // Ao clicar, cria uma notificação personalizada
      div.addEventListener("click", () => {
        criarNotificacao(`Evento em ${dia} de ${dataAtual.toLocaleString("pt-BR", { month: "long" })}`);
      });

      grid.appendChild(div);
    }
  }

  // Navegação entre meses
  document.getElementById("prevMonth").addEventListener("click", () => {
    dataAtual.setMonth(dataAtual.getMonth() - 1);
    atualizarCalendario();
  });

  document.getElementById("nextMonth").addEventListener("click", () => {
    dataAtual.setMonth(dataAtual.getMonth() + 1);
    atualizarCalendario();
  });

  atualizarCalendario();
}