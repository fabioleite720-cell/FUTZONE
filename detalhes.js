(function () {

  function ligaAPI(nome) {
    const mapa = {
      "Portugal": "por.1",
      "Inglaterra": "eng.1",
      "Espanha": "esp.1",
      "Itália": "ita.1",
      "Alemanha": "ger.1"
    };

    return mapa[nome] || "por.1";
  }

  function jogosVisiveis() {

    if (
      typeof jogos === "undefined" ||
      !Array.isArray(jogos)
    ) {
      return [];
    }

    return jogos.filter(function (j) {

      const ligaOK =
        typeof ligaAtual === "undefined" ||
        ligaAtual === "Todos" ||
        j.__liga === ligaAtual;

      const estado =
        typeof estadoJogo === "function"
          ? estadoJogo(j)
          : "";

      const filtroOK =
        typeof filtroAtual === "undefined" ||
        filtroAtual === "Todos" ||
        (filtroAtual === "LIVE" && estado === "LIVE") ||
        (filtroAtual === "Próximos" && estado === "PRÓXIMO") ||
        (filtroAtual === "Resultados" && estado === "RESULTADO");

      return ligaOK && filtroOK;
    });
  }

  function ligarCartoes() {

    const cards = Array.from(
      document.querySelectorAll(".card")
    ).filter(function (card) {
      return card.querySelector(".teams .team");
    });

    const lista = jogosVisiveis();

    cards.forEach(function (card, index) {

      if (card.dataset.detalhesLigados === "sim") {
        return;
      }

      card.dataset.detalhesLigados = "sim";
      card.style.cursor = "pointer";

      card.addEventListener("click", function (event) {

        // Se tocar no nome/equipa, mantém o funcionamento
        // normal da página da equipa.
        if (event.target.closest(".team")) {
          return;
        }

        const jogo = lista[index];

        if (!jogo) {
          alert("Não foi possível encontrar este jogo.");
          return;
        }

        const id =
          jogo.id ||
          jogo.uid ||
          jogo.eventId;

        if (!id) {
          alert("Este jogo não tem ID.");
          return;
        }

        const liga = ligaAPI(jogo.__liga);

        window.location.href =
          "detalhes.html?id=" +
          encodeURIComponent(id) +
          "&liga=" +
          encodeURIComponent(liga);
      });

    });
  }

  // Liga os cartões quando aparecem.
  setInterval(ligarCartoes, 500);

})();
