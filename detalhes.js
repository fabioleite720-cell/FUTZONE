(function () {
  "use strict";

  const MAPA_LIGAS = {
    "Portugal": "por.1",
    "Inglaterra": "eng.1",
    "Espanha": "esp.1",
    "Itália": "ita.1",
    "Alemanha": "ger.1"
  };

  function ligaAPI(nome) {
    return MAPA_LIGAS[nome] || "por.1";
  }

  function ligarCartoes() {
    document.querySelectorAll(".jogo-card").forEach(function (card) {

      if (card.dataset.detalhesLigados === "sim") return;

      const id = card.dataset.jogoId;

      if (!id) return;

      card.dataset.detalhesLigados = "sim";
      card.style.cursor = "pointer";

      card.addEventListener("click", function (e) {

        // Não abrir detalhes quando se toca diretamente no nome/equipa
        if (e.target.closest(".team")) return;

        const liga =
          card.dataset.jogoLiga ||
          "Portugal";

        window.location.href =
          "detalhes.html?id=" +
          encodeURIComponent(id) +
          "&liga=" +
          encodeURIComponent(ligaAPI(liga));
      });
    });
  }

  ligarCartoes();

  // Volta a ligar depois de a lista de jogos ser atualizada
  setInterval(ligarCartoes, 500);

})();
