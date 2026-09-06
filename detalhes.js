const params = new URLSearchParams(window.location.search);

const eventoId = params.get("id");
const liga = params.get("liga") || "por.1";

const app = document.getElementById("app");

async function carregarDetalhes() {

  if (!eventoId) {
    app.innerHTML = `
      <div class="card">
        Jogo não encontrado.
      </div>
    `;
    return;
  }

  app.innerHTML = `
    <div class="card">
      <h2>Detalhes do jogo</h2>
      <p>A carregar informações...</p>
    </div>
  `;

  try {

    const url =
      "https://site.api.espn.com/apis/site/v2/sports/soccer/" +
      liga +
      "/summary?event=" +
      encodeURIComponent(eventoId);

    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error("Erro API");
    }

    const dados = await resposta.json();

    const jogo =
      dados.header?.competitions?.[0];

    if (!jogo) {
      app.innerHTML = `
        <div class="card">
          <h2>Detalhes</h2>
          <p>Não existem informações disponíveis.</p>
        </div>
      `;
      return;
    }

    const equipas =
      jogo.competitors || [];

    const casa =
      equipas.find(e => e.homeAway === "home");

    const fora =
      equipas.find(e => e.homeAway === "away");

    const nomeCasa =
      casa?.team?.displayName || "Casa";

    const nomeFora =
      fora?.team?.displayName || "Fora";

    const resultadoCasa =
      casa?.score ?? "-";

    const resultadoFora =
      fora?.score ?? "-";

    const estado =
      jogo.status?.type?.detail || "";

    const eventos =
      dados.plays || [];

    app.innerHTML = `

      <button onclick="history.back()">
        ← Voltar
      </button>

      <div class="card">

        <h2>
          ${nomeCasa}
        </h2>

        <div class="score">
          ${resultadoCasa} - ${resultadoFora}
        </div>

        <h2>
          ${nomeFora}
        </h2>

        <p>${estado}</p>

      </div>

      <div class="card">

        <h3>📋 Eventos</h3>

        ${
          eventos.length
          ? eventos.map(e => `
              <p>
                ${e.clock?.displayValue || ""}
                ${e.text || ""}
              </p>
            `).join("")
          : "<p>Sem eventos registados.</p>"
        }

      </div>

    `;

  } catch (erro) {

    console.error(erro);

    app.innerHTML = `
      <div class="card">
        <h2>Erro</h2>
        <p>Não foi possível carregar os detalhes.</p>

        <button onclick="carregarDetalhes()">
          🔄 Tentar novamente
        </button>
      </div>
    `;
  }
}

carregarDetalhes();
