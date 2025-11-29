// Lógica de integração com o Journey Builder
define([
    'postmonger'
], function (Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};

    window.addEventListener('load', function() {
        console.log('Custom Activity Loaded');
        connection.trigger('ready');
    });

    // Evento acionado quando a activity é inicializada
    connection.on('initActivity', function(incomingPayload) {
        payload = incomingPayload;
        
        // Carregar dados salvos anteriormente
        if (payload['arguments'] && payload['arguments'].execute && 
            payload['arguments'].execute.inArguments[0]) {

            const inArgs = payload['arguments'].execute.inArguments[0];

            if(inArgs.setting1) {
                document.getElementById('setting1').value = inArgs.setting1;
            }
            if(inArgs.setting2) {
                document.getElementById('setting2').value = inArgs.setting2;
            }
        }
    });

    // Evento para quando o usuário clica em "Próximo" ou "Concluído"
    connection.on('clickedNext', function() {
        console.log('Clicou em Próximo');
        
        // pegar o nome dos inputs
        const setting1 = document.getElementById('setting1').value;
        const setting2 = document.getElementById('setting2').value;

        if (setting1 === '' || setting2 === '' ) {
            alert('Por favor, preencha a Configuração 1 e 2');
            return;
        }

        // Salvar a configuração no payload
        payload['arguments'].execute.inArguments = [{
            setting1: setting1,
            setting2: setting2
        }];

        payload['metaData'].isConfigured = true;
        
        // Enviar payload de volta para Journey Builder
        connection.trigger('updateActivity', payload);
        console.log('Dados salvos:', payload);
    });

    // Evento para quando o usuário clica em "Voltar"
    connection.on('clickedBack', function() {
        connection.trigger('prevStep');
    });
});
