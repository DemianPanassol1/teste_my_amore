# Simple Social API

API REST didatica de uma rede social simples, estilo "Facebook simplificado", feita com Node.js, Express, SQLite, JWT, bcrypt e Swagger.

## Requisitos

- Node.js 18 ou superior
- npm

## Instalacao

```bash
npm install
```

Opcionalmente, crie um arquivo `.env` baseado em `.env.example`:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Como rodar

```bash
npm run dev
```

Ou:

```bash
npm start
```

A API fica disponivel em:

```text
http://localhost:3000
```

O Swagger fica disponivel em:

```text
http://localhost:3000/api-docs
```

O banco SQLite e criado automaticamente em:

```text
database/app.sqlite
```

## Seed opcional

Para criar dados de exemplo:

```bash
npm run seed
```

Usuarios criados:

- `ana@example.com`
- `bruno@example.com`
- `carla@example.com`

Senha para todos:

```text
123456
```

Ana e Bruno ja sao amigos no seed. Carla fica sem amizade para facilitar testes de permissao.

## Formato das respostas

Sucesso:

```json
{
  "success": true,
  "data": {}
}
```

Erro:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Mensagem amigavel do erro",
    "details": []
  }
}
```

## Autenticacao

Depois de registrar ou fazer login, envie o token no header:

```text
Authorization: Bearer TOKEN
```

## Fluxo de uso sugerido

1. Registrar usuario A em `POST /auth/register`.
2. Registrar usuario B em `POST /auth/register`.
3. Fazer login com um dos usuarios em `POST /auth/login`.
4. Enviar solicitacao de amizade em `POST /friendships/request/:userId`.
5. Fazer login com o outro usuario e aceitar em `POST /friendships/:id/accept`.
6. Criar post em `POST /posts`.
7. Comentar no post em `POST /posts/:postId/comments`.
8. Ver o feed em `GET /posts/feed`.

## Principais regras implementadas

- `passwordHash` nunca e retornado nas respostas.
- Email e unico.
- Senha minima de 6 caracteres no cadastro.
- JWT e enviado por `Authorization: Bearer TOKEN`.
- Usuario nao pode enviar amizade para si mesmo.
- Nao existe amizade duplicada entre o mesmo par de usuarios.
- Apenas o destinatario aceita ou recusa uma solicitacao.
- Feed mostra posts proprios e de amigos aceitos.
- Usuario so ve posts de outro usuario se forem amigos.
- Usuario so comenta em post proprio ou de amigo.
- Apenas autores editam/excluem seus posts.
- Apenas autores excluem seus comentarios.

## Endpoints

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Users

- `GET /users`
- `GET /users/:id`

### Friendships

- `POST /friendships/request/:userId`
- `GET /friendships/requests`
- `GET /friendships/sent`
- `POST /friendships/:id/accept`
- `POST /friendships/:id/reject`
- `GET /friendships/friends`

### Posts

- `POST /posts`
- `GET /posts/feed`
- `GET /posts/user/:userId`
- `PUT /posts/:id`
- `DELETE /posts/:id`

### Comments

- `POST /posts/:postId/comments`
- `DELETE /comments/:id`

Consulte todos os detalhes, schemas, respostas e exemplos no Swagger em `/api-docs`.
