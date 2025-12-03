define(["postmonger"], function (Postmonger) {
  "use strict";

  const connection = new Postmonger.Session();
  let payload = {};

  connection.on("initActivity", function (incomingPayload) {
    payload = incomingPayload;

    const inArgs = payload?.arguments?.execute?.inArguments;

    console.log("Saved Arguments: ", inArgs);
  });

  connection.on("clickedNext", function () {
    const deName = document.getElementById("deName").value;
    const labelName = document.getElementById("labelName").value;

    if (!deName || !labelName) {
      alert("Por favor, preencha todos os campos obrigatórios.");
    }

    // let existingArgs = payload?.arguments?.execute?.inArguments || {};

    payload?.arguments?.execute?.inArguments = [
      {email: "yagodoteste123@pmweb.com.br"},
      {contactKey: "{{Contact.Key}}"}
    ]

    // transforma em um objeto só
    // let mergedArgs = Object.assign({}, existingArgs);

    // // adiciona os novos valores
    // mergedArgs.deName = deName;
    // mergedArgs.labelName = labelName;

    // // reatribui como array de objetos (formato que a SFMC exige)
    // payload.arguments.execute.inArguments = Object.keys(mergedArgs).map(key => ({
    //   [key]: mergedArgs[key],
    // }));

    console.log("Payload final: ", payload);

    payload.metaData.isConfigured = true;

    connection.trigger("updateActivity", payload);
  });

  connection.trigger("ready");
});
