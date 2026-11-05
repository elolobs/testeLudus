import { carregarAmbiente } from './config/ambiente.js';

const { porta } = carregarAmbiente();

const { app } = await import('./app.js');

app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`);
});