const params = new URLSearchParams(window.location.search);
const eventoId = params.get("id");
const liga = params.get("liga") || "por.1";

const API =
  `https://site.api.espn.com/apis/site/v2/sports/soccer/${liga}/summary?event=${eventoId}`;

const app = document.getElementById("app");

function esc(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nomeJogador(obj) {
  if (!obj) return "";

  return (
    obj.displayName ||
    obj.fullName ||
    obj.name ||
    obj.athlete?.displayName ||
    obj.athlete?.fullName ||
    ""
  );
}

function minutoEvento(p) {
  return (
    p.clock?.displayValue ||
    p.clock?.displayClock ||
    p.clock?.value ||
    p.minute ||
    ""
  );
}

function encontrarJogador(p) {
  if (p.athletesInvolved?.length) {
    return nomeJogador(p.athletesInvolved[0]);
  }

  if (p.athlete) {
    return nomeJogador(p.athlete);
  }

  if (p.athleteInvolved) {
    return nomeJogador(p.athleteInvolved);
  }

  return "";
}

function encontrarAssistencia(p) {
  if (p.athletesInvolved?.length > 1) {
    return nomeJogador(p.athletesInvolved[1]);
  }

  if (p.assist) {
    return nomeJogador(p.assist);
  }

  if (p.assistant) {
    return nomeJogador(p.assistant);
  }

  return "";
}

async function carregarDetalhes() {

  app.innerHTML = `
    <div style="padding:30px;text-align:center">
      A carregar...
    </div>
  `;

  try {

    const resposta = await fetch(API + "&t=" + Date.now(), {
      cache: "no-store"
    });

    const dados = await resposta.json();

    const jogo =
      dados.header?.competitions?.[0] ||
      dados.competitions?.[0];

    if (!jogo) {
      app.innerHTML = "<p>Jogo não encontrado.</p>";
      return;
    }

    const equipas = jogo.competitors || [];

    const casa = equipas.find(
      e => e.homeAway === "home"
    );

    const fora = equipas.find(
      e => e.homeAway === "away"
    );

    const nomeCasa =
      casa?.team?.displayName || "Casa";

    const nomeFora =
      fora?.team?.displayName || "Fora";

    const scoreCasa =
      casa?.score ?? "-";

    const scoreFora =
      fora?.score ?? "-";

    const estado =
      jogo.status?.type?.shortDetail ||
      jogo.status?.type?.detail ||
      "";

    const estadio =
      dados.gameInfo?.venue?.fullName ||
      dados.header?.competitions?.[0]?.venue?.fullName ||
      "";

    /*
     * TODOS OS EVENTOS
     */

    let plays = [];

    if (Array.isArray(dados.plays)) {
      plays = dados.plays;
    }

    if (
      Array.isArray(dados.scoringPlays)
    ) {
      plays = [
        ...plays,
        ...dados.scoringPlays
      ];
    }

    /*
     * REMOVER DUPLICADOS
     */

    const vistos = new Set();

    plays = plays.filter(p => {

      const chave =
        p.id ||
        (
          minutoEvento(p) +
          "|" +
          (p.text || "") +
          "|" +
          encontrarJogador(p)
        );

      if (vistos.has(chave)) {
        return false;
      }

      vistos.add(chave);
      return true;
    });

    /*
     * GOLOS
     */

    const golos = plays.filter(p =>
      p.scoringPlay === true ||
      p.scoreValue > 0 ||
      p.type?.id === "goal" ||
      p.type?.text?.toLowerCase().includes("goal") ||
      p.type?.text?.toLowerCase().includes("golo")
    );

    let htmlGolos = "";

    if (golos.length) {

      htmlGolos = golos.map(p => {

        const jogador =
          encontrarJogador(p);

        const assistencia =
          encontrarAssistencia(p);

        const minuto =
          minutoEvento(p);

        const texto =
          p.text || "";

        return `
          <div class="card">

            <div style="
              font-size:14px;
              font-weight:bold;
              margin-bottom:8px;
            ">
              ${esc(minuto)}
            </div>

            <div style="
              font-size:18px;
              font-weight:bold;
            ">
              ⚽ ${esc(
                jogador || texto || "Golo"
              )}
            </div>

            ${
              assistencia
                ? `
                  <div style="
                    margin-top:6px;
                    font-size:14px;
                  ">
                    Assistência: 
                    <b>${esc(assistencia)}</b>
                  </div>
                `
                : ""
            }

          </div>
        `;

      }).join("");

    } else {

      htmlGolos = `
        <div class="card">
          Ainda não existem golos
          detalhados para este jogo.
        </div>
      `;

    }

    /*
     * OUTROS EVENTOS
     */

    const outros = plays.filter(p => {

      const tipo =
        (
          p.type?.text ||
          p.text ||
          ""
        ).toLowerCase();

      return (
        p.yellowCard ||
        p.redCard ||
        p.substitution ||
        tipo.includes("yellow") ||
        tipo.includes("red card") ||
        tipo.includes("substitution")
      );

    });

    let htmlEventos = "";

    if (outros.length) {

      htmlEventos = outros.map(p => {

        const texto =
          p.text ||
          p.type?.text ||
          "Evento";

        return `
          <div class="card">

            <b>
              ${esc(
                minutoEvento(p)
              )}
            </b>

            <div style="margin-top:6px">
              ${esc(texto)}
            </div>

          </div>
        `;

      }).join("");

    } else {

      htmlEventos = `
        <div class="card">
          Sem outros eventos.
        </div>
      `;

    }

    /*
     * PÁGINA
     */

    app.innerHTML = `

      <div style="
        display:flex;
        justify-content:space-between;
        gap:10px;
        margin-bottom:15px;
      ">

        <button onclick="history.back()">
          ← Voltar
        </button>

        <button onclick="carregarDetalhes()">
          🔄 Atualizar
        </button>

      </div>

      <div class="card">

        <div style="
          text-align:center;
          font-size:14px;
          margin-bottom:15px;
        ">
          ${esc(
            dados.header?.league?.name ||
            "Futebol"
          )}
        </div>

        <div style="
          display:flex;
          align-items:center;
          justify-content:space-between;
          text-align:center;
          gap:10px;
        ">

          <div style="flex:1">
            <b>${esc(nomeCasa)}</b>
          </div>

          <div style="
            font-size:28px;
            font-weight:bold;
          ">
            ${esc(scoreCasa)}
            -
            ${esc(scoreFora)}
          </div>

          <div style="flex:1">
            <b>${esc(nomeFora)}</b>
          </div>

        </div>

        <div style="
          text-align:center;
          margin-top:12px;
        ">
          ${esc(estado)}
        </div>

        ${
          estadio
            ? `
              <div style="
                text-align:center;
                margin-top:10px;
                font-size:14px;
              ">
                🏟️ ${esc(estadio)}
              </div>
            `
            : ""
        }

      </div>


      <h2>⚽ Golos</h2>

      ${htmlGolos}


      <h2>📋 Eventos</h2>

      ${htmlEventos}

    `;

  } catch (erro) {

    console.error(erro);

    app.innerHTML = `
      <div class="card">
        Erro ao carregar os detalhes.
        <br><br>
        <button onclick="carregarDetalhes()">
          Tentar novamente
        </button>
      </div>
    `;

  }
}

carregarDetalhes();
