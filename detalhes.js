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

    cards.forEach(function (card) {

      if (card.dataset.detalhesLigados === "sim") {
        return;
      }

      card.dataset.detalhesLigados = "sim";
      card.style.cursor = "pointer";

      card.addEventListener("click", function (event) {

        /*
         * Se carregares no nome/logo da equipa,
         * continua a abrir a página da equipa.
         */
        if (
          event.target.closest &&
          event.target.closest(".team")
        ) {
          return;
        }

        const todosCards = Array.from(
          document.querySelectorAll(".card")
        ).filter(function (c) {
          return c.querySelector(".teams .team");
        });

        const indice = todosCards.indexOf(card);

        let jogo = lista[indice];

        /*
         * Se o índice não coincidir, tenta encontrar
         * o jogo através dos nomes das equipas.
         */
        if (!jogo) {

          const equipas =
            card.querySelectorAll(".teams .team");

          if (equipas.length >= 2) {

            const casa =
              equipas[0].innerText.trim();

            const fora =
              equipas[1].innerText.trim();

            jogo = lista.find(function (j) {

              try {

                const e = obterEquipas(j);

                const nomeCasa =
                  nomeEquipaSeguro(
                    e.home,
                    j,
                    true
                  );

                const nomeFora =
                  nomeEquipaSeguro(
                    e.away,
                    j,
                    false
                  );

                return (
                  nomeCasa === casa &&
                  nomeFora === fora
                );

              } catch (erro) {
                return false;
              }

            });

          }
        }

        if (!jogo) {

          alert(
            "Não foi possível encontrar este jogo."
          );

          return;
        }

        const id =
          jogo.id ||
          jogo.uid ||
          jogo.eventId;

        if (!id) {

          alert(
            "Este jogo não tem ID."
          );

          return;
        }

        const liga =
          ligaAPI(jogo.__liga);

        window.location.href =
          "detalhes.html?id=" +
          encodeURIComponent(id) +
          "&liga=" +
          encodeURIComponent(liga);

      });

    });
  }

  /*
   * A página carrega os jogos depois do JavaScript,
   * por isso verificamos regularmente se apareceram
   * novos cartões.
   */
  ligarCartoes();

  setInterval(
    ligarCartoes,
    1000
  );

})();
