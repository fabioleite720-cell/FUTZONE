(function () {
  "use strict";

  const ligas = {
    "Portugal": "por.1",
    "Inglaterra": "eng.1",
    "Espanha": "esp.1",
    "Itália": "ita.1",
    "Alemanha": "ger.1",

    // Competições europeias
    "Champions League": "uefa.champions",
    "Liga Europa": "uefa.europa",
    "Liga Conferência": "uefa.europa.conference"
  };

  document.addEventListener("click", function (e) {

    const card = e.target.closest(".jogo-card");

    if (!card) return;

    // Se carregarmos diretamente no nome da equipa,
    // mantém a abertura da página da equipa.
    if (e.target.closest(".team")) return;

    const id = card.dataset.jogoId;
    const ligaNome = card.dataset.jogoLiga || "Portugal";
    const liga = ligas[ligaNome] || "por.1";

    if (!id) {
      alert("Este jogo não tem ID.");
      return;
    }

    window.location.href =
      "detalhes.html?id=" +
      encodeURIComponent(id) +
      "&liga=" +
      encodeURIComponent(liga);

  });

})();
