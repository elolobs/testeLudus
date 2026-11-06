# Frontend

Aplicacao Next.js conectada a API Express para listar eventos e categorias,
consultar atividades e ingressos, criar contas e autenticar usuarios.

## Comandos

```bash
npm install
npm run dev
npm run build
npm start
npm run lint
npm test
```

## Ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Variavel principal:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

As instrucoes completas do projeto ficam no `README.md` da raiz.

Inicie o backend antes de usar as paginas integradas. O cadastro exige nome,
e-mail, CPF valido, senha com maiuscula, minuscula, numero e simbolo, e aceite
do termo LGPD. A API atual ainda nao oferece processamento de compras; a pagina
de detalhes mostra disponibilidade e preco dos ingressos sem simular uma venda.
