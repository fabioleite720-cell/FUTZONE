(function () {

  function abrirDetalhes(card) {

    if (!card) return;

    const equipas = Array.from(
      card.querySelectorAll(".team")
    );

    if (equipas.length < 2) {
      alert("Não foi possível identificar este jogo.");
      return;
    }

    const casa = equipas[0].textContent.trim();
    const fora = equipas[1].textContent.trim();

    if (typeof jogos === "undefined") {
      alert("Os jogos ainda estão a carregar.");
      return;
    }

    const jogo = jogos.find(j => {

      try {

        const e = obterEquipas(j);

        const h = nomeEquipaSeguro(e.home, j, true);
        const a = nomeEquipaSeguro(e.away, j, false);

        return (
          nomesEquivalentes(h, casa) &&
          nomesEquivalentes(a, fora)
        );

      } catch (erro) {
        return false;
      }

    });

    if (!jogo) {
      alert("Jogo não encontrado.");
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

    const ligas = {
      "Portugal": "por.1",
      "Inglaterra": "eng.1",
      "Espanha": "esp.1",
      "Itália": "ita.1",
      "Alemanha": "ger.1"
    };

    const liga =
      ligas[jogo.__liga] || "por.1";

    window.location.href =
      "detalhes.html?id=" +
      encodeURIComponent(id) +
      "&liga=" +
      encodeURIComponent(liga);
  }


  function ligarCartoes() {

    document.querySelectorAll(".card").forEach(card => {

      if (card.dataset.detalhesLigados)
        return;

      card.dataset.detalhesLigados = "1";

      card.style.cursor = "pointer";

      card.addEventListener("click", function (event) {

        // Não interferir no clique da equipa
        if (event.target.closest(".team"))
          return;

        abrirDetalhes(card);

      });

    });

  }


  setInterval(ligarCartoes, 1000);

  ligarCartoes();

})();
