(function () {

  function abrirDetalhes(card) {

    const jogo = card.__futzoneJogo;

    if (!jogo) {
      console.log("FUTZONE: jogo não encontrado");
      return;
    }

    const liga =
      jogo.__liga === "Portugal" ? "por.1" :
      jogo.__liga === "Inglaterra" ? "eng.1" :
      jogo.__liga === "Espanha" ? "esp.1" :
      jogo.__liga === "Itália" ? "ita.1" :
      jogo.__liga === "Alemanha" ? "ger.1" :
      "por.1";

    const id =
      jogo.id ||
      jogo.uid ||
      jogo.eventId;

    if (!id) {
      alert("Não foi possível encontrar o ID deste jogo.");
      return;
    }

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

      if (card.dataset.futzoneDetalhes === "1")
        return;

      card.dataset.futzoneDetalhes = "1";

      card.style.cursor = "pointer";

      card.addEventListener("click", function (event) {

        /*
          Se o utilizador carregou no nome
          de uma equipa, deixamos a página
          da equipa funcionar normalmente.
        */
        if (
          event.target.closest(".team")
        ) {
          return;
        }

        abrirDetalhes(card);

      });

    });

  }


  /*
    O index.html cria os cartões depois
    de carregar os jogos. Por isso verificamos
    periodicamente até os cartões aparecerem.
  */

  setInterval(ligarCartoes, 500);


  /*
    Também tentamos imediatamente.
  */

  ligarCartoes();


})();
