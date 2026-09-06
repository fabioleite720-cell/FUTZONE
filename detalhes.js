const params = new URLSearchParams(window.location.search);
const eventoId = params.get("id");
const liga = params.get("liga") || "por.1";

const API =
  `https://site.api.espn.com/apis/site/v2/sports/soccer/${liga}/summary?event=${eventoId}`;

const app = document.getElementById("app");

async function carregarDetalhes() {
  try {
    app.innerHTML = `
      <div class="loading">A carregar detalhes...</div>
    `;

    const resposta = await fetch(API, {
      cache: "no-store"
    });

    const dados = await resposta.json();
    alert(JSON.stringify(dados.scoringPlays));
document.body.innerHTML += "<pre style='white-space:pre-wrap;font-size:11px'>" + escapar(JSON.stringify(dados, null, 2)) + "</pre>";
    const jogo = dados.header?.competitions?.[0];

    if (!jogo) {
      app.innerHTML = "<p>Não foi possível carregar o jogo.</p>";
      return;
    }

    const equipas = jogo.competitors || [];

    const casa = equipas.find(e => e.homeAway === "home");
    const fora = equipas.find(e => e.homeAway === "away");

    const nomeCasa =
      casa?.team?.displayName ||
      casa?.team?.shortDisplayName ||
      "Casa";

    const nomeFora =
      fora?.team?.displayName ||
      fora?.team?.shortDisplayName ||
      "Fora";

    const resultadoCasa = casa?.score ?? "-";
    const resultadoFora = fora?.score ?? "-";

    const estado = jogo.status?.type?.shortDetail || "";

    // =========================
    // GOLOS
    // =========================

    let golos = [];

    if (Array.isArray(dados.scoringPlays)) {
      golos = dados.scoringPlays;
    }

    if (!golos.length && Array.isArray(dados.plays)) {
      golos = dados.plays.filter(p =>
        p.scoringPlay === true ||
        p.scoreValue
      );
    }

    const htmlGolos = golos.length
      ? golos.map(golo => {

          const minuto =
            golo.clock?.displayValue ||
            golo.clock?.value ||
            "";

          let jogador = "";

          if (golo.athletesInvolved?.length) {
            jogador =
              golo.athletesInvolved[0]?.displayName ||
              golo.athletesInvolved[0]?.fullName ||
              "";
          }

          if (!jogador && golo.text) {
            jogador = golo.text;
          }

          let assistencia = "";

          if (golo.athletesInvolved?.length > 1) {
            assistencia =
              golo.athletesInvolved[1]?.displayName ||
              golo.athletesInvolved[1]?.fullName ||
              "";
          }

          const equipa =
            golo.team?.displayName ||
            golo.team?.shortDisplayName ||
            "";

          return `
            <div class="evento golo">

              <div class="evento-minuto">
                ${minuto ? minuto : ""}
              </div>

              <div class="evento-info">

                <div class="evento-tipo">
                  ⚽ GOLO
                </div>

                <strong>
                  ${escapar(jogador)}
                </strong>

                ${
                  assistencia
                    ? `<div class="assistencia">
                        Assistência: ${escapar(assistencia)}
                       </div>`
                    : ""
                }

                ${
                  equipa
                    ? `<div class="equipa-golo">
                        ${escapar(equipa)}
                       </div>`
                    : ""
                }

              </div>

            </div>
          `;
        }).join("")
      : `
        <div class="sem-eventos">
          Ainda não existem golos registados.
        </div>
      `;


    // =========================
    // OUTROS EVENTOS
    // =========================

    const plays = Array.isArray(dados.plays)
      ? dados.plays
      : [];

    const outrosEventos = plays.filter(p =>
      p.yellowCard ||
      p.redCard ||
      p.substitution
    );

    const htmlEventos = outrosEventos.length
      ? outrosEventos.map(evento => {

          const minuto =
            evento.clock?.displayValue || "";

          let tipo = "";

          if (evento.yellowCard) tipo = "🟨 Cartão amarelo";
          if (evento.redCard) tipo = "🟥 Cartão vermelho";
          if (evento.substitution) tipo = "🔄 Substituição";

          const texto =
            evento.text ||
            evento.type?.text ||
            "";

          return `
            <div class="evento">

              <div class="evento-minuto">
                ${escapar(minuto)}
              </div>

              <div class="evento-info">
                <strong>${tipo}</strong>
                <div>${escapar(texto)}</div>
              </div>

            </div>
          `;
        }).join("")
      : `
        <div class="sem-eventos">
          Sem outros eventos registados.
        </div>
      `;


    // =========================
    // ESTÁDIO
    // =========================

    const estadio =
      dados.gameInfo?.venue?.fullName ||
      dados.gameInfo?.venue?.address?.city ||
      "";


    // =========================
    // DATA
    // =========================

    const data =
      jogo.date
        ? new Date(jogo.date).toLocaleString(
            "pt-PT",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            }
          )
        : "";


    // =========================
    // HTML
    // =========================

    app.innerHTML = `

      <div class="topo">

        <button onclick="history.back()">
          ← Voltar
        </button>

        <button onclick="carregarDetalhes()">
          🔄 Atualizar
        </button>

      </div>


      <div class="cabecalho-jogo">

        <div class="competicao">
          ${escapar(
            dados.header?.league?.name ||
            "Futebol"
          )}
        </div>

        <div class="equipas">

          <div class="equipa">
            <strong>${escapar(nomeCasa)}</strong>
          </div>

          <div class="resultado">

            <span>${escapar(resultadoCasa)}</span>

            <b>-</b>

            <span>${escapar(resultadoFora)}</span>

          </div>

          <div class="equipa">
            <strong>${escapar(nomeFora)}</strong>
          </div>

        </div>

        <div class="estado">
          ${escapar(estado)}
        </div>

        ${
          data
            ? `<div class="data">${escapar(data)}</div>`
            : ""
        }

        ${
          estadio
            ? `<div class="estadio">
                🏟️ ${escapar(estadio)}
               </div>`
            : ""
        }

      </div>


      <section class="secao">

        <h2>⚽ Golos</h2>

        ${htmlGolos}

      </section>


      <section class="secao">

        <h2>📋 Eventos</h2>

        ${htmlEventos}

      </section>

    `;
  }

  catch (erro) {

    console.error(erro);

    app.innerHTML = `
      <div class="erro">
        Erro ao carregar os detalhes.
        <br><br>
        <button onclick="carregarDetalhes()">
          Tentar novamente
        </button>
      </div>
    `;
  }
}


// =========================
// ESCAPAR HTML
// =========================

function escapar(valor) {

  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


carregarDetalhes();
