define([
    'postmonger'
], function (Postmonger) {
    'use strict';

    const connection = new Postmonger.Session();
    var payload = {};

    // Evento acionado quando a activity é inicializada
    connection.on('initActivity', function(incomingPayload) {
        payload = incomingPayload;
        
        // Carregar dados salvos anteriormente
        if (payload['arguments'] && payload['arguments'].execute && 
            payload['arguments'].execute.inArguments[0]) {

            const inArgs = payload['arguments'].execute.inArguments[0];

            if(inArgs.name) {
                document.getElementById('name').value = inArgs.name;
            }
            if(inArgs.email) {
                document.getElementById('email').value = inArgs.email;
            }
        }
    });

    // Evento para quando o usuário clica em "Próximo" ou "Concluído"
    connection.on('clickedNext', function() {       
        // pegar o nome dos inputs
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        // Salvar a configuração no payload
        payload['arguments'].execute.inArguments = [{
            name: name,
            email: email
        }];

        payload['metaData'].isConfigured = true;
        
        // Enviar payload de volta para Journey Builder
        connection.trigger('updateActivity', payload);
        insertContact(name, email);
    });

    // Evento para quando o usuário clica em "Voltar"
    

    connection.trigger('ready');
});