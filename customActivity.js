// Aonde tem a lógica dentro do Journey Builder, registra as informações
define(["postmonger"], function (Postmonger) {
  "use strict";

  const connection = new Postmonger.Session();
  var payload = {};

  // Evento acionado quando a activity é inicializada
  connection.on("initActivity", function (incomingPayload) {
    payload = incomingPayload;

    // Carregar dados salvos anteriormente
    if (
      payload["arguments"] &&
      payload["arguments"].execute &&
      payload["arguments"].execute.inArguments[0]
    ) {
      const inArgs = payload["arguments"].execute.inArguments[0];

      if (inArgs.deName) {
        document.getElementById("deName").value = inArgs.deName;
      }
      if (inArgs.labelName) {
        document.getElementById("labelName").value = inArgs.labelName;
      }
    }
  });

  // Evento para quando o usuário clica em "Próximo" ou "Concluído"
  connection.on("clickedNext", function () {
    // pegar o nome dos inputs
    const deName = document.getElementById("deName").value;
    const labelName = document.getElementById("labelName").value;

    if (deName === "" && labelName === "") {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    // Salvar a configuração no payload
    payload["arguments"].execute.inArguments = [
      {
        deName: deName,
        labelName: labelName,
      },
    ];

    payload["metaData"].isConfigured = true;

    // Enviar payload de volta para Journey Builder
    connection.trigger("updateActivity", payload);
    console.log("Payload enviado:", payload);
  });

  connection.trigger("ready");
});
