define(["postmonger"], function (Postmonger) {
  "use strict";

  const connection = new Postmonger.Session();
  let payload = {};

  function getInArgumentsAsObject(inArguments) {
    if (!Array.isArray(inArguments)) {
      return {};
    }

    return Object.assign({}, ...inArguments);
  }

  function setFieldValue(fieldId, value) {
    if (value && value !== "") {
      document.getElementById(fieldId).value = value;
    }
  }

  connection.on("initActivity", function (incomingPayload) {
    payload = incomingPayload || {};

    const inArgs = getInArgumentsAsObject(
      payload?.arguments?.execute?.inArguments
    );

    setFieldValue("nomeCampanha", inArgs.nomeCampanha);
    setFieldValue("idDataExtension", inArgs.idDataExtension);
  });

  connection.on("clickedNext", function () {
    const nomeCampanha = document.getElementById("nomeCampanha").value.trim();
    const idDataExtension = document
      .getElementById("idDataExtension")
      .value.trim();

    if (!nomeCampanha || !idDataExtension) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    payload.arguments = payload.arguments || {};
    payload.arguments.execute = payload.arguments.execute || {};

    const existingArgs = getInArgumentsAsObject(
      payload.arguments.execute.inArguments
    );

    const mergedArgs = {
      ...existingArgs,
      nomeCampanha,
      idDataExtension,
    };

    payload.arguments.execute.inArguments = Object.entries(mergedArgs).map(
      ([key, value]) => ({
        [key]: value,
      })
    );

    payload.metaData = payload.metaData || {};
    payload.metaData.isConfigured = true;

    connection.trigger("updateActivity", payload);
  });

  connection.trigger("ready");
});
