// Lógica de integração com o Journey Builder
define([
    'postmonger'
], function (Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};

    $(window).ready(function() {
        connection.trigger('ready');
    });

    // Evento acionado quando a activity é inicializada
    connection.on('initActivity', function(incomingPayload) {
        payload = incomingPayload;
        
        // Carregar dados salvos anteriormente
        if (payload['arguments'] && payload['arguments'].execute && 
            payload['arguments'].execute.inArguments) {
            
            var inArguments = payload['arguments'].execute.inArguments;
            
            // Recuperar valores salvos
            if (inArguments[0] && inArguments[0].setting1) {
                $('#setting1').val(inArguments[0].setting1);
            }
        }
    });

    // Evento para quando o usuário clica em "Próximo" ou "Concluído"
    connection.on('clickedNext', function() {
        // Validar dados
        if ($('#setting1').val() === '') {
            alert('Por favor, preencha a Configuração 1');
            return;
        }

        // Salvar a configuração no payload
        payload['arguments'].execute.inArguments = [{
            setting1: $('#setting1').val(),
            setting2: $('#setting2').val()
        }];

        payload['metaData'].isConfigured = true;
        
        // Enviar payload de volta para Journey Builder
        connection.trigger('updateActivity', payload);
    });

    // Evento para quando o usuário clica em "Voltar"
    connection.on('clickedBack', function() {
        connection.trigger('prevStep');
    });
});
