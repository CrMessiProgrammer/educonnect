/* interactivity.js
   - notificações
   - gráfico (Chart.js)
   - calendário interativo (mostrar cards somente se houver eventos)
*/

// Notificações (global)
function criarNotificacao(texto, isEvento = false) {
  const container = document.querySelector(".notification-container") || criarContainerNotificacoes();
  const notif = document.createElement("div");
  notif.classList.add("notification");
  if (isEvento) notif.classList.add("notification-evento");
  notif.textContent = texto;
  container.appendChild(notif);
  setTimeout(() => {
    notif.style.opacity = "0";
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

function criarContainerNotificacoes() {
  const container = document.createElement("div");
  container.classList.add("notification-container");
  document.body.appendChild(container);
  return container;
}

// Gráfico de desempenho (simples)
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
          "rgba(74,144,226,0.9)",
          "rgba(80,227,194,0.9)",
          "rgba(245,166,35,0.9)",
          "rgba(144,19,254,0.9)",
          "rgba(184,233,134,0.9)"
        ],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { display: false } }
    }
  });
}

// Calendário interativo
function renderCalendario() {
  const contentArea = document.getElementById("contentArea");
  contentArea.innerHTML = `
    <section class="calendar-section">
      <div class="calendar-header">
        <button id="prevMonth" aria-label="Mês anterior">&lt;</button>
        <h3 id="monthYear"></h3>
        <button id="nextMonth" aria-label="Próximo mês">&gt;</button>
      </div>
      <div class="calendar-grid" id="calendarGrid"></div>
    </section>

    <section class="eventos-section">
      <h4>Compromissos do Dia</h4>
      <div id="eventosDoDia" class="eventos-container">
        <p class="sem-eventos">Selecione uma data para visualizar os compromissos.</p>
      </div>
    </section>
  `;

  const mesAno = document.getElementById("monthYear");
  const grid = document.getElementById("calendarGrid");
  const eventosContainer = document.getElementById("eventosDoDia");

  // Eventos mock (formato YYYY-MM-DD)
  const eventos = {
    "2025-11-12": ["Prova de Matemática", "Entrega de Trabalho de História"],
    "2025-11-18": ["Reunião de pais", "Fechamento de notas"],
    "2025-11-20": ["Simulado de Ciências"]
  };

  let dataAtual = new Date();

  function atualizarCalendario() {
    grid.innerHTML = "";
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();

    mesAno.textContent = dataAtual.toLocaleString("pt-BR", { month: "long", year: "numeric" });

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();

    // espaços antes do primeiro dia
    for (let i = 0; i < primeiroDia; i++) {
      const empty = document.createElement("div");
      grid.appendChild(empty);
    }

    for (let dia = 1; dia <= ultimoDia; dia++) {
      const div = document.createElement("div");
      div.classList.add("calendar-day");
      div.textContent = dia;

      const hoje = new Date();
      if (dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()) {
        div.classList.add("today");
      }

      const dataFormatada = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

      // marca dias com eventos
      if (eventos[dataFormatada]) {
        div.classList.add("has-event");
      }

      // clique no dia
      div.addEventListener("click", () => {
        // limpar selects anteriores
        document.querySelectorAll(".calendar-day.selected").forEach(d => d.classList.remove("selected"));
        div.classList.add("selected");

        const compromissos = eventos[dataFormatada];
        eventosContainer.innerHTML = "";

        if (compromissos && compromissos.length) {
          compromissos.forEach(evt => {
            criarNotificacao(`📅 ${evt}`, true);
            const card = document.createElement("div");
            card.classList.add("card-compromisso");
            card.textContent = evt;
            eventosContainer.appendChild(card);
          });
        } else {
          criarNotificacao(`Nenhum compromisso para ${dia} de ${dataAtual.toLocaleString("pt-BR", { month: "long" })}.`);
          eventosContainer.innerHTML = `<p class="sem-eventos">Sem compromissos para este dia.</p>`;
        }
      });

      grid.appendChild(div);
    }
  }

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