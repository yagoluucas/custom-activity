define(["postmonger"], function (Postmonger) {
  "use strict";

  const connection = new Postmonger.Session();
  let payload = {};

  connection.on("initActivity", function (incomingPayload) {
    payload = incomingPayload;

    const inArgs = payload?.arguments?.execute?.inArguments;

    if(inArgs.nomeCampanha && inArgs.nomeCampanha.length > 0){
      document.getElementById("nomeCampanha").value = inArgs.nomeCampanha;
    }
  });

  connection.on("clickedNext", function () {
    const nomeCampanha = document.getElementById("nomeCampanha").value;

    if (!nomeCampanha) {
      alert("Por favor, preencha todos os campos obrigatórios.");
    }

    let existingArgs = payload?.arguments?.execute?.inArguments || {};

    let mergedArgs = Object.assign({}, existingArgs);

    // adiciona os novos valores
    mergedArgs.nomeCampanha = nomeCampanha;

    // reatribui como array de objetos (formato que a SFMC exige)
    payload.arguments.execute.inArguments = Object.keys(mergedArgs).map(key => ({
      [key]: mergedArgs[key],
    }));

    payload.metaData.isConfigured = true;

    connection.trigger("updateActivity", payload);
  });

  connection.trigger("ready");
});
