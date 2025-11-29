const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Rota para servir o config.json
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para config.json
app.get('/config.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'config.json'));
});

// ========== ROTAS DE EXECUÇÃO ==========

// Endpoint de Execute (chamado quando contato passa pela activity)
app.post('/execute', (req, res) => {
    try {
        console.log('=== EXECUTE ===');
        console.log('Body recebido:', JSON.stringify(req.body, null, 2));

        // Pega os dados do contato
        const inArguments = req.body.inArguments || [];
        console.log('InArguments:', inArguments);

        // Sua lógica aqui - por enquanto apenas retorna sucesso
        const response = {
            outArguments: [
                {
                    resultado: 'success'
                }
            ]
        };

        console.log('Response:', response);
        res.status(200).json(response);
    } catch (error) {
        console.error('Erro em /execute:', error);
        res.status(400).json({ error: error.message });
    }
});

// Endpoint de Save (quando usuário salva configuração)
app.post('/save', (req, res) => {
    try {
        console.log('=== SAVE ===');
        console.log('Body:', JSON.stringify(req.body, null, 2));
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erro em /save:', error);
        res.status(400).json({ error: error.message });
    }
});

// Endpoint de Publish (quando journey é publicada)
app.post('/publish', (req, res) => {
    try {
        console.log('=== PUBLISH ===');
        console.log('Body:', JSON.stringify(req.body, null, 2));
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erro em /publish:', error);
        res.status(400).json({ error: error.message });
    }
});

// Endpoint de Validate (validação de configuração)
app.post('/validate', (req, res) => {
    try {
        console.log('=== VALIDATE ===');
        console.log('Body:', JSON.stringify(req.body, null, 2));
        
        res.status(200).json({ valid: true });
    } catch (error) {
        console.error('Erro em /validate:', error);
        res.status(400).json({ error: error.message });
    }
});

// Endpoint de Stop (quando journey é parada)
app.post('/stop', (req, res) => {
    try {
        console.log('=== STOP ===');
        console.log('Body:', JSON.stringify(req.body, null, 2));
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erro em /stop:', error);
        res.status(400).json({ error: error.message });
    }
});

// ========== INICIAR SERVIDOR ==========

app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║   Custom Activity Server Rodando      ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║   🚀 http://localhost:${PORT}           ║`);
    console.log('║                                        ║');
    console.log('║   Endpoints disponíveis:              ║');
    console.log(`║   POST http://localhost:${PORT}/execute  ║`);
    console.log(`║   POST http://localhost:${PORT}/save     ║`);
    console.log(`║   POST http://localhost:${PORT}/publish  ║`);
    console.log(`║   POST http://localhost:${PORT}/validate ║`);
    console.log(`║   POST http://localhost:${PORT}/stop     ║`);
    console.log('╚════════════════════════════════════════╝');
    console.log('');
});
