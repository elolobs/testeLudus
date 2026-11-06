# API de eventos

## Configuração

Copie `.env.example` para `.env` e altere credenciais do MySQL. Configure
`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` para o banco que
recebeu `database/init/banco.sql`. `JWT_SECRET` deve ter pelo menos 32
caracteres e ser mantido em segredo.

Inicie a API com `npm run dev` ou `npm start`.

## Autenticação

- `POST /api/auth/registrar`: recebe `nome_completo`, `email`, `senha`, `cpf`,
  `telefone` (opcional) e `termo_lgpd_aceito: true`. O cadastro cria usuários
  com cargo `USUARIO`; cargos privilegiados não podem ser escolhidos no cadastro.
  O CPF pode ser fictício, mas deve conter exatamente 11 dígitos após remover
  pontuação. Ele precisa ser único na base.
- `POST /api/auth/login`: recebe `email` e `senha`; retorna um token Bearer.
- Envie o token nas rotas autenticadas usando
  `Authorization: Bearer <token>`.

As senhas `hash_senha_*` do SQL de exemplo são placeholders e não permitem
login. Para desenvolvimento, cadastre uma conta e atribua o cargo `ADMIN` a
ela por uma operação administrativa confiável no banco antes de usar as rotas
restritas a administradores.

## Recursos do banco

Cada recurso abaixo possui `GET /`, `GET /:id`, `POST /`, `PUT /:id`,
`PATCH /:id` e `DELETE /:id`, sujeitos às permissões indicadas:

| Rota | Tabela |
| --- | --- |
| `/api/usuarios` | `usuarios` |
| `/api/categorias` | `categorias` |
| `/api/eventos` | `eventos` |
| `/api/equipe-evento` | `equipe_evento` |
| `/api/atividades` | `atividades` |
| `/api/tipos-ingresso` | `tipo_ingresso` |
| `/api/pedidos` | `pedidos` |
| `/api/itens-pedido` | `itens_pedido` |
| `/api/ingressos` | `ingressos` |
| `/api/lista-espera` | `lista_espera` |

As listagens aceitam `limite` (1 a 100, padrão 50) e `deslocamento` (padrão
0), além de filtros por campos definidos para cada recurso.

Categorias, eventos publicados, atividades de eventos publicados e tipos de
ingresso desses eventos podem ser consultados sem autenticação. Administradores
podem gerenciar os registros de todos os recursos; a criação de contas continua
exclusiva da rota de cadastro. Organizadores podem gerenciar seus eventos,
equipe, atividades e tipos de ingresso vinculados a eles. Usuários podem
consultar seus próprios registros e alterar o próprio nome e telefone com
`PATCH /api/usuarios/:id`. Escritas em pedidos, itens de pedido e ingressos são
restritas a administradores.

Datas devem ser enviadas em formato reconhecido pelo JavaScript, preferivelmente
ISO 8601. Os valores de `ENUM` devem corresponder exatamente aos definidos no
SQL.
