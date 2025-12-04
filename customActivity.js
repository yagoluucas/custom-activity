define(["postmonger"], function (Postmonger) {
  "use strict";

  const connection = new Postmonger.Session();
  let payload = {};

  connection.on("initActivity", function (incomingPayload) {
    payload = incomingPayload;

    const inArgs = payload?.arguments?.execute?.inArguments;

    // inArgs é um array de objectos

    const nomeCampanha = inArgs.filter((arg) => arg.hasOwnProperty("nomeCampanha"))[0]?.nomeCampanha
    if(nomeCampanha && nomeCampanha !== ""){
        document.getElementById("nomeCampanha").value = nomeCampanha;
    }
  });

  connection.on("clickedNext", function () {
    const nomeCampanha = document.getElementById("nomeCampanha").value;

    if (!nomeCampanha) {
      alert("Por favor, preencha todos os campos obrigatórios.");
    }

    // Garante que inArguments existe e é array
    let inArgs = payload?.arguments?.execute?.inArguments;

    if (!Array.isArray(inArgs)) {
        inArgs = [];
    }

    // Converte array de objetos para um objeto único
    let mergedArgs = Object.assign({}, ...inArgs);

    // Adiciona novo arg
    mergedArgs.nomeCampanha = nomeCampanha;

    // Converte novamente para array de pares chave/valor
    payload.arguments.execute.inArguments = Object.entries(mergedArgs).map(([key, value]) => ({
        [key]: value
    }));

    payload.metaData.isConfigured = true;

    connection.trigger("updateActivity", payload);
  });

  connection.trigger("ready");
});
