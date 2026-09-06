(function () {

  function encontrarJogo(card) {

    // Procurar os nomes das duas equipas no cartão
    const equipas = Array.from(
      card.querySelectorAll(".team")
    )
      .map(el => el.textContent.trim())
      .filter(Boolean);

    if (equipas.length < 2) {
      console.log("FUTZONE: não encontrei as duas equipas");
      return null;
    }

    const casaTexto = equipas[0];
    const foraTexto = equipas[1];

    // Procurar o jogo correspondente nos dados carregados pelo index.html
    if (typeof jogos === "undefined" || !Array.isArray(jogos)) {
      console.log("FUTZONE: lista de jogos não disponível");
      return null;
    }

    return jogos.find(function (jogo) {

      try {

        const equipasJogo = obterEquipas(jogo);

        const casa = nomeEquipaSeguro(
          equipasJogo.home,
          jogo,
          true
        );

        const fora = nomeEquipaSeguro(
          equipasJogo.away,
          jogo,
          false
        );

        return (
          nomesEquivalentes(casa, casaTexto) &&
          nomesEquivalentes(fora, foraTexto)
        );

      } catch (e) {
        return false;
      }

    }) || null;
  }


  function obterLiga(jogo) {

    if (jogo.__liga === "Portugal")
      return "por.1";

    if (jogo.__liga === "Inglaterra")
      return "eng.1";

    if (jogo.__liga === "Espanha")
      return "esp.1";

    if (jogo.__liga === "Itália")
      return "ita.1";

    if (jogo.__liga === "Alemanha")
      return "ger.1";

    return "por.1";
  }


  function abrirDetalhes(card) {

    const jogo = encontrarJogo(card);

    if (!jogo) {
      alert(
        "Não foi possível encontrar os dados deste jogo. Tenta novamente."
      );
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

    const liga = obterLiga(jogo);

    window.location.href =
      "detalhes.html?id=" +
      encodeURIComponent(id) +
      "&liga=" +
      encodeURIComponent(liga);
  }


  function ligarCartoes() {

    const cards =
      document.querySelectorAll(".card");

    cards.forEach(function (card) {

      if (
        card.dataset.futzoneDetalhes === "1"
      ) {
        return;
      }

      card.dataset.futzoneDetalhes = "1";

      card.style.cursor = "pointer";

      card.addEventListener(
        "click",
        function (event) {

          // Se tocar no nome da equipa,
          // continua a abrir a página da equipa
          if (
            event.target.closest(".team")
          ) {
            return;
          }

          abrirDetalhes(card);

        }
      );

    });

  }


  // Os cartões são criados depois dos jogos
  // por isso verificamos regularmente
  setInterval(
    ligarCartoes,
    500
  );


  // Tentativa inicial
  ligarCartoes();


})();
