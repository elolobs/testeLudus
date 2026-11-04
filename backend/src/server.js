import { carregarAmbiente } from './config/ambiente.js';

console.log('Carregando ambiente...');
const config = carregarAmbiente('./src/.env');

const { app } = await import('./app.js');
const porta = config.porta || 8080;

app.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});