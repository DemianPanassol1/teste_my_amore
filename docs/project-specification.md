# Introdução

O Vínculo é uma rede social simplificada voltada para conexões entre pessoas, publicação de textos curtos e interação por comentários. A aplicação deve permitir que um usuário crie uma conta, faça login, encontre outros usuários, envie e responda solicitações de amizade, publique posts em texto, comente em posts permitidos e acompanhe seu próprio perfil.

O objetivo do Front-End é consumir a API REST existente e entregar uma experiência funcional, clara e coerente com os designs aprovados. Esta especificação descreve o comportamento esperado do sistema sob a perspectiva do usuário e deve ser usada como referência principal para a implementação.

O público-alvo é composto por usuários finais de uma rede social leve, sem upload de imagens, sem mensagens privadas, sem notificações em tempo real e sem recursos avançados. O sistema deve priorizar fluxos simples: entrar, ver o feed, publicar, comentar, gerenciar amizades e consultar o perfil.

O fluxo geral do usuário é:

1. Acessar a aplicação.
2. Fazer login ou criar cadastro.
3. Entrar no Feed.
4. Ver posts próprios e de amigos.
5. Criar posts e comentários.
6. Buscar pessoas.
7. Enviar, aceitar, recusar ou remover amizades.
8. Consultar e editar o próprio perfil.
9. Sair da conta quando desejar.

# Tecnologias esperadas

O Front-End deve ser desenvolvido utilizando:

- React.
- Vite.
- SCSS.
- Context API.
- Fetch API.
- React Router.
- React Toastify.

O uso dessas tecnologias deve seguir uma abordagem simples e didática. O projeto não deve depender de bibliotecas complexas de gerenciamento de estado, como Redux, Zustand ou MobX. O consumo da API deve ser feito com `fetch`, encapsulado preferencialmente em funções reutilizáveis para reduzir duplicação.

# Regras globais da aplicação

## Autenticação obrigatória

Todas as áreas internas da aplicação exigem autenticação. Um usuário não autenticado não pode acessar:

- `/feed`
- `/friends`
- `/friend-requests`
- `/profile`

Caso um usuário sem token tente acessar qualquer rota protegida, deve ser redirecionado para `/login`.

As rotas `/login` e `/register` são públicas. Caso um usuário autenticado tente acessar `/login` ou `/register`, deve ser redirecionado para `/feed`.

## Armazenamento do token

Após login ou cadastro bem-sucedido, o token JWT retornado pela API deve ser armazenado no navegador.

O armazenamento recomendado para este projeto é `localStorage`, usando uma chave clara, por exemplo:

```text
vinculo:token
```

Também devem ser armazenados os dados públicos do usuário logado, quando necessário para exibição imediata da interface. Os dados sensíveis nunca devem ser armazenados ou exibidos. A aplicação nunca deve esperar, manipular ou exibir `passwordHash`.

## Envio do token nas requisições

Toda requisição autenticada deve enviar o token no header:

```text
Authorization: Bearer TOKEN
```

Se o token não existir, a requisição autenticada não deve ser feita. Nesse caso, o usuário deve ser redirecionado para `/login`.

## Proteção de rotas

O Front-End deve possuir uma estratégia centralizada de proteção de rotas. O comportamento esperado é:

- Se não houver token, redirecionar para `/login`.
- Se houver token, permitir o acesso inicial.
- Ao carregar a aplicação, validar a sessão chamando `GET /auth/me`.
- Se `GET /auth/me` retornar sucesso, manter usuário autenticado.
- Se `GET /auth/me` retornar `401`, limpar os dados locais e redirecionar para `/login`.

## Comportamento de logout

Ao clicar em "Sair", a aplicação deve:

1. Remover o token do armazenamento local.
2. Remover os dados do usuário autenticado do estado global.
3. Redirecionar para `/login`.
4. Impedir retorno às rotas protegidas sem novo login.

Não existe endpoint de logout. O logout é exclusivamente local.

## Tratamento de erros

Todas as chamadas à API devem tratar os erros de forma padronizada.

Quando a API retornar o formato:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Mensagem amigável",
    "details": []
  }
}
```

A interface deve priorizar a exibição de `error.message`.

Se houver `details`, eles podem ser usados para mensagens próximas aos campos quando fizer sentido, especialmente em formulários. Se não houver tratamento por campo, exibir um toast de erro com a mensagem principal.

## Estados de carregamento

Toda ação assíncrona deve ter estado de carregamento perceptível. Isso inclui:

- Login.
- Cadastro.
- Validação da sessão.
- Carregamento do feed.
- Criação de post.
- Criação de comentário.
- Listagem de usuários.
- Envio de solicitação.
- Remoção de amizade.
- Carregamento de solicitações.
- Aceite de solicitação.
- Recusa de solicitação.
- Carregamento do perfil.
- Atualização do perfil.

Durante uma requisição de ação, o botão responsável deve ficar desabilitado para evitar cliques duplicados.

## Estados vazios

Todas as listagens devem possuir mensagem de estado vazio. A tela nunca deve parecer quebrada por não haver dados.

Estados vazios esperados:

- Nenhum post no feed.
- Nenhum comentário em um post.
- Nenhum usuário encontrado na busca.
- Nenhum amigo.
- Nenhuma solicitação recebida.
- Nenhum post no perfil.

## Feedback visual para usuário

O usuário deve receber feedback claro após ações importantes:

- Login com sucesso.
- Cadastro com sucesso.
- Post criado.
- Comentário enviado.
- Solicitação de amizade enviada.
- Solicitação aceita.
- Solicitação recusada.
- Amizade removida.
- Perfil atualizado.
- Logout realizado, se for coerente com a experiência.

Erros também devem ser comunicados de forma clara, sem mensagens técnicas.

## Toasts de sucesso

Usar React Toastify para mensagens de sucesso após ações que alteram dados.

Exemplos de mensagens:

- "Login realizado com sucesso."
- "Cadastro realizado com sucesso."
- "Post publicado com sucesso."
- "Comentário enviado."
- "Solicitação de amizade enviada."
- "Solicitação aceita."
- "Solicitação recusada."
- "Amizade removida."
- "Perfil atualizado com sucesso."

## Toasts de erro

Usar React Toastify para erros gerais ou erros de ação.

Exemplos:

- "E-mail ou senha inválidos."
- "Preencha os campos obrigatórios."
- "Não foi possível carregar o feed."
- "Não foi possível enviar a solicitação."
- "Não foi possível atualizar o perfil."
- "Sessão expirada. Faça login novamente."
- "Erro de conexão. Tente novamente."

## Desabilitação de botões durante requisições

Todo botão que dispara requisição deve ficar desabilitado enquanto a requisição estiver em andamento.

Exemplos:

- Botão "Entrar" durante login.
- Botão "Cadastrar" durante cadastro.
- Botão "Publicar" durante criação de post.
- Botão "Enviar" durante criação de comentário.
- Botão "Adicionar amigo" durante envio de solicitação.
- Botões "Aceitar" e "Recusar" durante resposta de solicitação.
- Botão "Remover" durante remoção de amizade.
- Botão de salvar edição de perfil durante atualização.

## Redirecionamentos

Redirecionamentos obrigatórios:

- Login bem-sucedido: redirecionar para `/feed`.
- Cadastro bem-sucedido: armazenar token e redirecionar para `/feed`.
- Logout: redirecionar para `/login`.
- Token ausente em rota protegida: redirecionar para `/login`.
- Token inválido ou expirado: limpar sessão e redirecionar para `/login`.
- Usuário autenticado acessando `/login` ou `/register`: redirecionar para `/feed`.

# Fluxos da aplicação

## Tela de Login

### Objetivo

Permitir que um usuário existente acesse a aplicação informando e-mail e senha.

### Campos

A tela deve possuir:

- Campo `E-mail`.
- Campo `Senha`.
- Botão `Entrar`.
- Link para cadastro.
- Link "Esqueci minha senha", se estiver no design, mas sem funcionalidade obrigatória neste momento.

### Validações

Antes de enviar a requisição:

- E-mail é obrigatório.
- E-mail deve possuir formato válido.
- Senha é obrigatória.

Se algum campo estiver inválido, a requisição não deve ser enviada.

### Comportamento dos inputs

O input de e-mail deve:

- Aceitar texto.
- Remover espaços extras no início e no fim antes do envio.
- Ser tratado como e-mail.

O input de senha deve:

- Mascarar o conteúdo.
- Preservar o valor digitado até o envio ou limpeza do formulário.

### Comportamento do botão Entrar

Ao clicar em `Entrar`:

1. Validar os campos.
2. Se houver erro local, exibir feedback ao usuário.
3. Desabilitar o botão.
4. Exibir estado de loading.
5. Enviar requisição para a API.
6. Reabilitar o botão ao final, se não houver redirecionamento.

### Endpoint consumido

```http
POST /auth/login
```

### Payload enviado

```json
{
  "email": "usuario@example.com",
  "password": "123456"
}
```

### Resposta esperada

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Marina Costa",
      "email": "marina.costa@example.com"
    },
    "token": "jwt"
  }
}
```

### Tratamento de erros

Se a API retornar `401`, exibir mensagem como:

```text
E-mail ou senha inválidos.
```

Se a API retornar `400`, exibir mensagem de validação.

Se ocorrer erro de rede, exibir:

```text
Não foi possível conectar ao servidor. Tente novamente.
```

### Comportamento do loading

Durante o login:

- O botão `Entrar` deve ficar desabilitado.
- O texto do botão pode indicar carregamento, como "Entrando...".
- O usuário não deve conseguir disparar múltiplas tentativas simultâneas.

### Comportamento após sucesso

Após sucesso:

1. Armazenar token.
2. Armazenar dados do usuário no estado de autenticação.
3. Exibir toast de sucesso.
4. Redirecionar para `/feed`.

### Critérios de aceite

- O usuário não consegue enviar login com e-mail vazio.
- O usuário não consegue enviar login com senha vazia.
- O usuário não consegue enviar login com e-mail inválido.
- O botão fica desabilitado durante a requisição.
- Erros da API são exibidos ao usuário.
- O token é armazenado após sucesso.
- O usuário é redirecionado para `/feed` após sucesso.
- Usuário autenticado não deve permanecer na tela de login.

## Tela de Cadastro

### Objetivo

Permitir que um novo usuário crie uma conta no Vínculo.

### Campos

A tela deve possuir:

- Campo `Nome`.
- Campo `E-mail`.
- Campo `Senha`.
- Campo `Confirmar senha`.
- Botão de cadastro.
- Link para login.

### Validações

Antes de enviar a requisição:

- Nome é obrigatório.
- Nome não pode conter apenas espaços.
- E-mail é obrigatório.
- E-mail deve possuir formato válido.
- Senha é obrigatória.
- Senha deve ter no mínimo 6 caracteres.
- Confirmar senha é obrigatório.
- Confirmar senha deve ser igual à senha.

Se houver qualquer erro local, a requisição não deve ser enviada.

### Comportamento dos inputs

O campo nome deve:

- Aceitar texto.
- Remover espaços extras no início e fim antes do envio.

O campo e-mail deve:

- Aceitar texto.
- Remover espaços extras no início e fim antes do envio.
- Ser enviado em formato aceito pela API.

Os campos senha e confirmar senha devem:

- Mascarar o conteúdo.
- Não ser armazenados em Context API.
- Não ser persistidos em `localStorage`.

### Endpoint consumido

```http
POST /auth/register
```

### Payload enviado

```json
{
  "name": "Marina Costa",
  "email": "marina.costa@example.com",
  "password": "123456"
}
```

O campo `confirmPassword` é apenas do Front-End e não deve ser enviado para a API.

### Resposta esperada

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Marina Costa",
      "email": "marina.costa@example.com"
    },
    "token": "jwt"
  }
}
```

### Tratamento de erros

Se a API retornar conflito de e-mail já cadastrado, exibir:

```text
Este e-mail já está cadastrado.
```

Se a API retornar erro de validação, exibir a mensagem retornada.

Se ocorrer erro de rede, exibir:

```text
Não foi possível criar sua conta. Tente novamente.
```

### Comportamento do loading

Durante o cadastro:

- O botão deve ficar desabilitado.
- O texto pode mudar para "Cadastrando...".
- O usuário não deve conseguir enviar o mesmo formulário múltiplas vezes.

### Comportamento após sucesso

Após cadastro bem-sucedido:

1. Armazenar token.
2. Armazenar dados públicos do usuário.
3. Exibir toast de sucesso.
4. Redirecionar para `/feed`.

### Critérios de aceite

- Nome vazio impede envio.
- E-mail vazio impede envio.
- E-mail inválido impede envio.
- Senha menor que 6 caracteres impede envio.
- Confirmação diferente da senha impede envio.
- `confirmPassword` não é enviado para a API.
- E-mail já cadastrado exibe erro amigável.
- Cadastro bem-sucedido autentica o usuário.
- Usuário autenticado é redirecionado para `/feed`.

## Feed

### Objetivo

Exibir posts do usuário logado e de amigos aceitos, permitir criação de posts de texto e permitir comentários em posts visíveis.

### Estrutura funcional da tela

A tela de Feed deve conter:

- Área de criação de post.
- Contador de caracteres do post.
- Lista de posts.
- Comentários de cada post.
- Campo para criar comentário em cada post.
- Área lateral ou seção de sugestões, se prevista no design, usando dados disponíveis de usuários.

### Carregamento inicial

Ao entrar em `/feed`, a aplicação deve:

1. Verificar autenticação.
2. Chamar `GET /posts/feed`.
3. Exibir estado de carregamento enquanto a resposta não chega.
4. Renderizar a lista de posts após sucesso.
5. Exibir estado vazio se não houver posts.

### Endpoint de busca de posts

```http
GET /posts/feed
```

### Resposta esperada

Cada post deve conter:

- Identificador do post.
- Autor.
- Conteúdo.
- Data de criação.
- Lista de comentários.

### Ordenação dos posts

Os posts devem ser exibidos na ordem retornada pela API. A expectativa funcional é que os posts mais recentes apareçam primeiro.

O Front-End não deve reordenar os posts, exceto se houver necessidade local temporária após criação. Mesmo nesse caso, ao recarregar o feed, deve prevalecer a ordem da API.

### Criação de post

O usuário deve conseguir criar posts apenas em texto.

Endpoint:

```http
POST /posts
```

Payload:

```json
{
  "content": "Texto do post"
}
```

### Validações de post

Antes de enviar:

- Conteúdo é obrigatório.
- Conteúdo não pode conter apenas espaços.
- Conteúdo deve ter no mínimo 1 caractere.
- Conteúdo deve ter no máximo 500 caracteres.

### Contador de caracteres

O contador deve indicar a quantidade de caracteres digitados em relação ao limite:

```text
0/500
```

Comportamento esperado:

- Atualizar conforme o usuário digita.
- Não permitir envio acima de 500 caracteres.
- Se ultrapassar 500 caracteres, exibir feedback e manter o botão desabilitado.

### Comportamento do botão Publicar

O botão `Publicar` deve:

- Ficar desabilitado quando o campo estiver vazio.
- Ficar desabilitado quando o campo tiver mais de 500 caracteres.
- Ficar desabilitado durante a requisição.
- Exibir feedback de loading durante a requisição.

Após sucesso:

1. Limpar campo de texto.
2. Resetar contador.
3. Exibir toast de sucesso.
4. Atualizar o feed.

A atualização do feed pode ser feita de duas formas:

- Inserir o novo post no estado local, se a resposta tiver dados suficientes.
- Ou chamar novamente `GET /posts/feed`.

### Exibição dos comentários

Cada post deve exibir seus comentários retornados pela API.

Para cada comentário, exibir:

- Autor.
- Conteúdo.
- Data ou indicação temporal, se disponível no design.

Se um post não tiver comentários, exibir mensagem amigável:

```text
Seja o primeiro a comentar.
```

### Criação de comentário

O usuário deve conseguir comentar nos posts exibidos no feed.

Endpoint:

```http
POST /posts/:postId/comments
```

Payload:

```json
{
  "content": "Comentário"
}
```

### Validações de comentário

Antes de enviar:

- Comentário é obrigatório.
- Comentário não pode conter apenas espaços.
- Comentário deve ter no mínimo 1 caractere.
- Comentário deve ter no máximo 500 caracteres.

### Comportamento do envio de comentário

Ao enviar comentário:

1. Validar campo.
2. Desabilitar botão do comentário específico.
3. Enviar requisição.
4. Em caso de sucesso, limpar o campo daquele post.
5. Atualizar a lista de comentários daquele post.
6. Exibir toast de sucesso.

A atualização pode ser local ou por recarregamento do feed.

### Loading states do Feed

Estados esperados:

- Loading geral ao carregar posts.
- Loading no botão `Publicar`.
- Loading individual no botão `Enviar` de cada comentário.

O loading de um comentário não deve bloquear a tela inteira nem outros posts.

### Empty states do Feed

Se não houver posts:

```text
Nenhum post por enquanto. Publique algo ou adicione amigos para ver novidades.
```

Se um post não tiver comentários:

```text
Seja o primeiro a comentar.
```

### Tratamento de erro

Se `GET /posts/feed` falhar:

```text
Não foi possível carregar o feed.
```

Se criar post falhar:

```text
Não foi possível publicar o post.
```

Se criar comentário falhar:

```text
Não foi possível enviar o comentário.
```

Se a API retornar `401`, encerrar sessão e redirecionar para `/login`.

### Critérios de aceite

- Feed carrega posts próprios e de amigos.
- Posts aparecem com autor, conteúdo e comentários.
- Post vazio não pode ser enviado.
- Post com mais de 500 caracteres não pode ser enviado.
- Contador exibe limite `500`.
- Comentário vazio não pode ser enviado.
- Comentário com mais de 500 caracteres não pode ser enviado.
- Botões ficam desabilitados durante requisição.
- Erros são exibidos por toast.
- Estado vazio é exibido quando não há posts.

## Amigos

### Objetivo

Permitir que o usuário encontre pessoas, veja o status de amizade, envie solicitações e remova amigos aceitos.

### Carregamento dos usuários

Ao entrar em `/friends`, a aplicação deve chamar:

```http
GET /users
```

A listagem deve excluir o próprio usuário, conforme retorno da API.

Cada usuário pode conter:

- `id`
- `name`
- `email`
- `friendship`
- `mutualFriendsCount`

### Busca

A tela deve permitir busca por nome. A API também pode buscar por e-mail.

Ao buscar, chamar:

```http
GET /users?search=texto
```

Comportamento esperado:

- O termo de busca deve ser enviado como query string.
- A busca deve preservar o usuário autenticado fora da lista.
- A lista deve continuar exibindo status de amizade.
- A lista deve continuar exibindo `mutualFriendsCount`.

A busca pode ser feita:

- Ao submeter o campo.
- Ou enquanto o usuário digita, desde que haja controle para evitar excesso de requisições.

### Status de amizade

Cada usuário listado pode estar em um dos estados:

1. Sem amizade.
2. Solicitação enviada pelo usuário logado.
3. Solicitação recebida pelo usuário logado.
4. Amizade aceita.
5. Solicitação rejeitada.

### Estado: sem amizade

Quando `friendship` for `null`, exibir ação para adicionar amigo.

Ação:

```http
POST /friendships/request/:userId
```

Após sucesso:

- Exibir toast "Solicitação de amizade enviada."
- Atualizar o usuário na lista para estado de solicitação enviada.
- O botão não deve continuar permitindo novo envio.

### Estado: solicitação enviada

Quando existir amizade com:

- `status: pending`
- `requesterId` igual ao usuário logado

Exibir estado informativo:

```text
Solicitação enviada
```

Não exibir botão de adicionar novamente.

### Estado: solicitação recebida

Quando existir amizade com:

- `status: pending`
- `addresseeId` igual ao usuário logado

Exibir ações:

- `Aceitar`
- `Recusar`

Endpoints:

```http
POST /friendships/:id/accept
POST /friendships/:id/reject
```

Após aceitar:

- Exibir toast "Solicitação aceita."
- Atualizar estado para amizade aceita.

Após recusar:

- Exibir toast "Solicitação recusada."
- Atualizar a lista para refletir que a solicitação não está mais pendente.

### Estado: amizade aceita

Quando existir amizade com `status: accepted`, exibir:

- Indicação de que já são amigos.
- Botão `Remover`.

Endpoint:

```http
DELETE /friendships/:id
```

Após sucesso:

- Exibir toast "Amizade removida."
- Atualizar a lista para remover o estado de amizade.
- O usuário deve deixar de aparecer como amigo aceito.

### Estado: solicitação rejeitada

Se a API retornar uma amizade com `status: rejected`, o Front-End deve tratar como uma relação sem ação pendente. A exibição pode ser equivalente a usuário sem amizade, desde que respeite o comportamento da API caso uma nova solicitação não seja permitida.

Se a API retornar erro ao tentar nova solicitação, exibir mensagem retornada pela API.

### Filtros

A tela pode possuir filtros como:

- Todos.
- Meus amigos.
- Sugestões.

Comportamento funcional:

- `Todos`: exibir todos os usuários retornados por `GET /users`.
- `Meus amigos`: exibir usuários com `friendship.status === "accepted"`.
- `Sugestões`: exibir usuários sem amizade aceita, priorizando quem não possui solicitação pendente.

Não existe endpoint dedicado para sugestões. A tela deve usar `GET /users` e filtrar localmente, se necessário.

### Amigos em comum

Quando `mutualFriendsCount` estiver disponível, exibir a quantidade de amigos em comum.

Regras de texto:

- `0`: não é necessário exibir, salvo se o design exigir.
- `1`: "1 amigo em comum".
- Maior que `1`: "N amigos em comum".

### Loading states

Estados esperados:

- Loading inicial ao carregar usuários.
- Loading ao buscar.
- Loading individual por ação de adicionar, aceitar, recusar ou remover.

Uma ação em um card não deve bloquear todos os outros cards, exceto se a implementação optar por recarregar a lista completa.

### Empty states

Sem usuários:

```text
Nenhuma pessoa encontrada.
```

Sem amigos no filtro "Meus amigos":

```text
Você ainda não possui amigos adicionados.
```

Sem sugestões:

```text
Nenhuma sugestão disponível no momento.
```

Sem resultado de busca:

```text
Nenhum resultado encontrado para sua busca.
```

### Tratamento de erro

Falha ao carregar usuários:

```text
Não foi possível carregar a lista de pessoas.
```

Falha ao enviar solicitação:

```text
Não foi possível enviar a solicitação.
```

Falha ao remover amizade:

```text
Não foi possível remover a amizade.
```

### Critérios de aceite

- Lista de usuários não mostra o usuário logado.
- Busca por nome funciona.
- Busca mantém status de amizade.
- Busca mantém amigos em comum.
- Usuário sem amizade permite adicionar.
- Solicitação enviada não permite reenviar.
- Solicitação recebida permite aceitar ou recusar.
- Amigo aceito permite remover amizade.
- Após remover amizade, usuário deixa de aparecer como amigo.
- Estados vazios são exibidos corretamente.

## Solicitações

### Objetivo

Permitir que o usuário visualize solicitações recebidas pendentes e responda aceitando ou recusando.

### Carregamento das solicitações recebidas

Ao entrar em `/friend-requests`, chamar:

```http
GET /friendships/requests
```

Cada solicitação deve conter:

- Identificador da solicitação.
- Usuário solicitante.
- Status.
- Quantidade de amigos em comum, quando disponível.

### Exibição dos dados

Para cada solicitação recebida, exibir:

- Nome do solicitante.
- E-mail do solicitante.
- Amigos em comum, se disponível.
- Botão `Aceitar`.
- Botão `Recusar`.

### Aceitar solicitação

Endpoint:

```http
POST /friendships/:id/accept
```

Após sucesso:

1. Exibir toast "Solicitação aceita."
2. Remover a solicitação da lista de pendentes.
3. Garantir que esse usuário apareça como amigo na tela de amigos.

### Recusar solicitação

Endpoint:

```http
POST /friendships/:id/reject
```

Após sucesso:

1. Exibir toast "Solicitação recusada."
2. Remover a solicitação da lista de pendentes.

### Atualização da interface após ação

Após aceitar ou recusar, a interface deve atualizar imediatamente.

Opções aceitas:

- Remover o item do estado local.
- Ou recarregar `GET /friendships/requests`.

O usuário não deve precisar atualizar a página.

### Loading states

Cada solicitação deve ter loading próprio para os botões.

Durante o aceite:

- Desabilitar `Aceitar`.
- Desabilitar `Recusar` do mesmo item.

Durante a recusa:

- Desabilitar `Aceitar`.
- Desabilitar `Recusar` do mesmo item.

### Empty state

Se não houver solicitações:

```text
Você não possui solicitações pendentes.
```

### Tratamento de erro

Falha ao carregar:

```text
Não foi possível carregar suas solicitações.
```

Falha ao aceitar:

```text
Não foi possível aceitar a solicitação.
```

Falha ao recusar:

```text
Não foi possível recusar a solicitação.
```

Se a solicitação já tiver sido respondida, exibir a mensagem retornada pela API.

### Critérios de aceite

- Solicitações pendentes são carregadas ao abrir a tela.
- Solicitações exibem dados do solicitante.
- Amigos em comum aparecem quando retornados.
- Aceitar remove a solicitação da lista.
- Recusar remove a solicitação da lista.
- Botões ficam desabilitados durante ação.
- Estado vazio aparece quando não há solicitações.

## Perfil

### Objetivo

Permitir que o usuário visualize seus dados, estatísticas, posts próprios e edite nome ou e-mail.

### Carregamento do perfil

Ao entrar em `/profile`, chamar:

```http
GET /users/me/profile
```

Esse endpoint deve fornecer:

- Dados públicos do usuário.
- Quantidade de posts.
- Quantidade de amigos.
- Quantidade de comentários feitos pelo usuário.

Também deve carregar os posts do usuário logado.

Endpoint:

```http
GET /posts/user/:userId
```

O `userId` deve ser obtido do usuário autenticado.

### Dados exibidos

A tela deve exibir:

- Nome do usuário.
- E-mail do usuário.
- Quantidade de posts.
- Quantidade de amigos.
- Quantidade de comentários.
- Lista de posts do usuário.

Não deve exibir:

- Senha.
- Hash de senha.
- Campos técnicos que não agreguem valor ao usuário.

### Estatísticas

As estatísticas devem usar os valores retornados por `GET /users/me/profile`.

Definições:

- `postsCount`: quantidade de posts criados pelo usuário.
- `friendsCount`: quantidade de amizades aceitas do usuário.
- `commentsCount`: quantidade de comentários feitos pelo usuário.

### Lista de posts

Os posts do perfil devem vir de:

```http
GET /posts/user/:userId
```

Cada post deve exibir:

- Autor.
- Conteúdo.
- Comentários.
- Campo para comentar, quando aplicável.

Como o perfil é do próprio usuário, o usuário pode comentar nos próprios posts.

### Comentários no perfil

Comentários dos posts devem seguir o mesmo comportamento do Feed:

- Exibir comentários existentes.
- Permitir enviar comentário.
- Validar comentário entre 1 e 500 caracteres.
- Exibir estado vazio quando não houver comentários.

### Edição de perfil

A tela deve permitir edição do próprio perfil.

Campos editáveis:

- Nome.
- E-mail.

Campos não editáveis neste fluxo:

- Senha.
- Avatar.
- Capa.
- Qualquer imagem.

Endpoint:

```http
PUT /users/me
```

Payload possível:

```json
{
  "name": "Marina Costa",
  "email": "marina.costa@example.com"
}
```

### Validações da edição

Antes de enviar:

- Nome, se enviado, não pode estar vazio.
- E-mail, se enviado, deve ter formato válido.
- Pelo menos um campo deve ser enviado.
- Senha não deve ser enviada.

### Atualização de nome

Ao atualizar nome com sucesso:

- Atualizar nome exibido no perfil.
- Atualizar nome no AuthContext, se o usuário logado estiver armazenado lá.
- Exibir toast "Perfil atualizado com sucesso."

### Atualização de e-mail

Ao atualizar e-mail com sucesso:

- Atualizar e-mail exibido no perfil.
- Atualizar e-mail no AuthContext, se necessário.
- Exibir toast "Perfil atualizado com sucesso."

Se o e-mail já estiver em uso, exibir:

```text
Este e-mail já está cadastrado.
```

### Loading states

Estados esperados:

- Loading ao carregar dados do perfil.
- Loading ao carregar posts.
- Loading ao salvar edição.
- Loading ao enviar comentário em post do perfil.

### Empty states

Sem posts:

```text
Você ainda não publicou nenhum post.
```

Sem comentários em um post:

```text
Seja o primeiro a comentar.
```

### Tratamento de erro

Falha ao carregar perfil:

```text
Não foi possível carregar seu perfil.
```

Falha ao carregar posts:

```text
Não foi possível carregar seus posts.
```

Falha ao atualizar perfil:

```text
Não foi possível atualizar seu perfil.
```

### Critérios de aceite

- Perfil carrega dados do usuário logado.
- Estatísticas aparecem corretamente.
- Posts do usuário são carregados.
- Usuário consegue comentar nos próprios posts.
- Usuário consegue atualizar nome.
- Usuário consegue atualizar e-mail.
- E-mail duplicado exibe erro.
- Senha não é enviada no endpoint de edição.
- Dados atualizados aparecem sem exigir logout.

# Context API

## AuthContext

O `AuthContext` deve centralizar os dados de autenticação.

Responsabilidades recomendadas:

- Guardar token.
- Guardar usuário logado.
- Informar se a sessão está sendo validada.
- Expor função de login.
- Expor função de cadastro.
- Expor função de logout.
- Expor função para atualizar os dados locais do usuário após edição de perfil.
- Validar sessão ao carregar a aplicação.

Estado sugerido:

```text
user
token
isAuthenticated
isCheckingAuth
```

Funções sugeridas:

```text
login(email, password)
register(name, email, password)
logout()
checkSession()
updateAuthenticatedUser(user)
```

O token deve ser lido do `localStorage` ao iniciar a aplicação. Se existir token, chamar `GET /auth/me` para confirmar que a sessão ainda é válida.

## UserContext

O `UserContext` pode centralizar dados relacionados a usuários e amizades quando esses dados forem compartilhados por mais de uma página.

Responsabilidades possíveis:

- Lista de usuários.
- Termo de busca atual.
- Função para carregar usuários.
- Função para enviar solicitação.
- Função para aceitar solicitação.
- Função para recusar solicitação.
- Função para remover amizade.

O `UserContext` não deve substituir o `AuthContext`. Dados de autenticação permanecem no `AuthContext`.

## Estado local

Dados usados apenas por uma tela podem ficar em estado local.

Exemplos:

- Texto do post sendo digitado.
- Texto de comentário de um post.
- Loading de botão individual.
- Filtro selecionado na tela de amigos.
- Modo de edição do perfil.
- Campos do formulário de edição.
- Lista de posts do Feed, se usada apenas no Feed.
- Lista de solicitações, se usada apenas na tela de Solicitações.

## Compartilhamento do token entre páginas

O token deve ser acessível por todas as páginas que fazem requisições autenticadas.

Recomendação:

- O `AuthContext` fornece o token.
- Um helper de API recebe o token e monta o header `Authorization`.
- Em caso de erro `401`, o helper ou a camada chamadora deve acionar logout e redirecionamento.

O desenvolvedor deve evitar copiar manualmente a lógica de headers em todos os componentes. O ideal é criar uma função central para requisições autenticadas.

# Estrutura de rotas

## `/login`

Rota pública.

Responsável por:

- Exibir formulário de login.
- Consumir `POST /auth/login`.
- Armazenar token após sucesso.
- Redirecionar para `/feed`.

Usuário autenticado não deve permanecer nessa rota.

## `/register`

Rota pública.

Responsável por:

- Exibir formulário de cadastro.
- Validar nome, e-mail, senha e confirmação de senha.
- Consumir `POST /auth/register`.
- Armazenar token após sucesso.
- Redirecionar para `/feed`.

Usuário autenticado não deve permanecer nessa rota.

## `/feed`

Rota protegida.

Responsável por:

- Exibir posts próprios e de amigos.
- Criar posts.
- Exibir comentários.
- Criar comentários.

Endpoints principais:

- `GET /posts/feed`
- `POST /posts`
- `POST /posts/:postId/comments`

## `/friends`

Rota protegida.

Responsável por:

- Listar usuários.
- Buscar usuários.
- Exibir status de amizade.
- Enviar solicitação.
- Aceitar ou recusar solicitação recebida, se aparecer nessa tela.
- Remover amizade.

Endpoints principais:

- `GET /users`
- `GET /users?search=texto`
- `POST /friendships/request/:userId`
- `POST /friendships/:id/accept`
- `POST /friendships/:id/reject`
- `DELETE /friendships/:id`

## `/friend-requests`

Rota protegida.

Responsável por:

- Listar solicitações recebidas pendentes.
- Aceitar solicitações.
- Recusar solicitações.

Endpoints principais:

- `GET /friendships/requests`
- `POST /friendships/:id/accept`
- `POST /friendships/:id/reject`

## `/profile`

Rota protegida.

Responsável por:

- Exibir dados do usuário logado.
- Exibir estatísticas.
- Exibir posts próprios.
- Permitir comentários nos próprios posts.
- Permitir edição de nome e e-mail.

Endpoints principais:

- `GET /users/me/profile`
- `GET /posts/user/:userId`
- `PUT /users/me`
- `POST /posts/:postId/comments`

# Estados de carregamento

## Login

Durante o envio do login:

- Desabilitar botão `Entrar`.
- Indicar que a requisição está em andamento.
- Não bloquear navegação global desnecessariamente.

## Cadastro

Durante o envio do cadastro:

- Desabilitar botão de cadastro.
- Indicar que a conta está sendo criada.
- Impedir múltiplos envios.

## Validação da sessão

Ao abrir a aplicação com token salvo:

- Exibir estado inicial de validação.
- Não renderizar rotas protegidas antes de concluir a validação.
- Se a sessão for válida, continuar.
- Se for inválida, redirecionar para `/login`.

## Feed

Durante carregamento inicial:

- Exibir indicador de carregamento na área de posts.

Durante criação de post:

- Desabilitar botão `Publicar`.

Durante envio de comentário:

- Desabilitar somente o botão do comentário enviado.

## Amigos

Durante carregamento:

- Exibir indicador na área da lista.

Durante ações:

- Desabilitar botão específico do usuário afetado.
- Evitar múltiplas solicitações para a mesma ação.

## Solicitações

Durante carregamento:

- Exibir indicador na área de solicitações.

Durante aceite ou recusa:

- Desabilitar os botões do item afetado.

## Perfil

Durante carregamento:

- Exibir indicador para dados do perfil.
- Exibir indicador para posts, se carregados separadamente.

Durante edição:

- Desabilitar botão de salvar.

Durante comentário:

- Desabilitar botão de envio do comentário específico.

# Estados vazios

## Nenhum post no feed

Mensagem:

```text
Nenhum post por enquanto. Publique algo ou adicione amigos para ver novidades.
```

## Nenhum post no perfil

Mensagem:

```text
Você ainda não publicou nenhum post.
```

## Nenhum comentário

Mensagem:

```text
Seja o primeiro a comentar.
```

## Nenhum amigo

Mensagem:

```text
Você ainda não possui amigos adicionados.
```

## Nenhuma solicitação

Mensagem:

```text
Você não possui solicitações pendentes.
```

## Nenhum resultado encontrado

Mensagem:

```text
Nenhum resultado encontrado para sua busca.
```

## Nenhuma sugestão disponível

Mensagem:

```text
Nenhuma sugestão disponível no momento.
```

# Tratamento de erros

## Erros de autenticação

Quando a API retornar `401` em qualquer rota protegida:

1. Exibir toast:

```text
Sessão expirada. Faça login novamente.
```

2. Remover token.
3. Remover usuário do estado global.
4. Redirecionar para `/login`.

## Erros de validação

Quando a API retornar `400`:

- Exibir a mensagem retornada pela API.
- Se houver detalhes por campo, usar esses detalhes para orientar o usuário.
- Não limpar automaticamente o formulário, exceto se a ação fizer sentido.

Exemplos:

- Post acima de 500 caracteres.
- Comentário vazio.
- E-mail inválido.
- Nome vazio.

## Erros de conflito

Quando a API retornar `409`:

- Exibir mensagem amigável com base na resposta da API.

Casos esperados:

- E-mail já cadastrado.
- Solicitação de amizade duplicada.
- Usuários já são amigos.
- Solicitação já respondida.
- Tentativa de remover amizade que não está aceita.

## Erros de permissão

Quando a API retornar `403`:

- Exibir mensagem amigável.
- Não repetir automaticamente a ação.
- Atualizar a interface se o erro indicar que o estado atual está desatualizado.

Exemplos:

- Tentar aceitar solicitação que não pertence ao usuário.
- Tentar remover amizade da qual o usuário não participa.
- Tentar comentar em post não permitido.

## Erros de recurso não encontrado

Quando a API retornar `404`:

- Exibir mensagem amigável.
- Remover ou atualizar o item da interface se ele não existir mais.

Exemplo:

```text
Este item não está mais disponível.
```

## Erros de rede

Quando não houver resposta da API:

```text
Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.
```

O usuário deve poder tentar novamente.

## Erros inesperados

Para erros genéricos:

```text
Ocorreu um erro inesperado. Tente novamente.
```

Não exibir stack trace, nomes de arquivos, mensagens técnicas ou dados internos.

# Critérios de aceite

## Autenticação e sessão

- A aplicação permite login com e-mail e senha válidos.
- A aplicação impede login com campos vazios.
- A aplicação impede login com e-mail inválido.
- A aplicação exibe erro em credenciais inválidas.
- A aplicação armazena o token após login.
- A aplicação permite cadastro com nome, e-mail, senha e confirmação de senha válidos.
- A aplicação impede cadastro com nome vazio.
- A aplicação impede cadastro com e-mail vazio.
- A aplicação impede cadastro com e-mail inválido.
- A aplicação impede cadastro com senha menor que 6 caracteres.
- A aplicação impede cadastro quando confirmação de senha diverge da senha.
- A aplicação não envia `confirmPassword` para a API.
- A aplicação exibe erro quando e-mail já está cadastrado.
- Após login, o usuário vai para `/feed`.
- Após cadastro, o usuário vai para `/feed`.
- Rotas protegidas redirecionam usuários sem token para `/login`.
- Usuário autenticado não permanece em `/login` ou `/register`.
- Ao recarregar a página, a sessão é validada com `GET /auth/me`.
- Token inválido remove sessão e redireciona para `/login`.
- Logout remove token, limpa usuário e redireciona para `/login`.

## Feed

- Ao abrir `/feed`, a aplicação chama `GET /posts/feed`.
- O feed exibe posts do usuário e de amigos aceitos.
- Posts exibem autor, conteúdo e comentários.
- Posts são exibidos na ordem retornada pela API.
- Estado de loading aparece enquanto o feed carrega.
- Estado vazio aparece quando não há posts.
- Usuário consegue criar post de texto.
- Post vazio não pode ser enviado.
- Post com apenas espaços não pode ser enviado.
- Post com 500 caracteres pode ser enviado.
- Post com 501 caracteres não pode ser enviado.
- Contador de caracteres usa limite `500`.
- Botão `Publicar` fica desabilitado durante envio.
- Após publicar, o campo é limpo.
- Após publicar, o feed é atualizado.
- Toast de sucesso aparece após publicar.
- Toast de erro aparece se publicar falhar.
- Comentários existentes são exibidos em cada post.
- Estado vazio de comentário aparece quando não há comentários.
- Usuário consegue comentar em posts exibidos.
- Comentário vazio não pode ser enviado.
- Comentário com apenas espaços não pode ser enviado.
- Comentário com mais de 500 caracteres não pode ser enviado.
- Botão de comentário fica desabilitado durante envio.
- Após comentar, o campo de comentário é limpo.
- Após comentar, a lista de comentários é atualizada.

## Amigos

- Ao abrir `/friends`, a aplicação chama `GET /users`.
- A lista não exibe o próprio usuário.
- Cada usuário mostra nome e e-mail.
- Cada usuário mostra status de amizade.
- Cada usuário mostra amigos em comum quando disponível.
- Busca por nome chama `GET /users?search=texto`.
- Busca mantém status de amizade.
- Busca mantém amigos em comum.
- Estado vazio aparece quando busca não encontra resultados.
- Usuário sem amizade exibe ação de adicionar.
- Clicar em adicionar chama `POST /friendships/request/:userId`.
- Botão de adicionar fica desabilitado durante envio.
- Após solicitação enviada, o estado muda para "Solicitação enviada".
- Não é possível reenviar solicitação pendente.
- Solicitação recebida exibe ações de aceitar e recusar.
- Aceitar chama `POST /friendships/:id/accept`.
- Recusar chama `POST /friendships/:id/reject`.
- Amizade aceita exibe indicação de amigo.
- Amizade aceita permite remover amizade.
- Remover chama `DELETE /friendships/:id`.
- Após remover, o usuário deixa de aparecer como amigo.
- Filtro "Todos" exibe todos os usuários retornados.
- Filtro "Meus amigos" exibe apenas amizades aceitas.
- Filtro "Sugestões" usa dados de `GET /users` e não depende de endpoint próprio.

## Solicitações

- Ao abrir `/friend-requests`, a aplicação chama `GET /friendships/requests`.
- Solicitações recebidas pendentes são exibidas.
- Cada solicitação exibe dados do solicitante.
- Cada solicitação exibe amigos em comum quando disponível.
- Botão `Aceitar` chama `POST /friendships/:id/accept`.
- Botão `Recusar` chama `POST /friendships/:id/reject`.
- Botões do item ficam desabilitados durante ação.
- Após aceitar, a solicitação sai da lista.
- Após recusar, a solicitação sai da lista.
- Estado vazio aparece quando não há solicitações.
- Erros de ação são exibidos por toast.

## Perfil

- Ao abrir `/profile`, a aplicação chama `GET /users/me/profile`.
- Perfil exibe nome do usuário.
- Perfil exibe e-mail do usuário.
- Perfil exibe quantidade de posts.
- Perfil exibe quantidade de amigos.
- Perfil exibe quantidade de comentários feitos pelo usuário.
- A aplicação carrega posts do usuário com `GET /posts/user/:userId`.
- Posts próprios aparecem no perfil.
- Estado vazio aparece se o usuário não tiver posts.
- Comentários dos posts aparecem no perfil.
- Usuário consegue comentar nos próprios posts.
- Edição de perfil permite alterar nome.
- Edição de perfil permite alterar e-mail.
- Edição de perfil não permite alterar senha.
- `PUT /users/me` não recebe campo de senha.
- Nome vazio não pode ser enviado.
- E-mail inválido não pode ser enviado.
- E-mail duplicado exibe erro.
- Após editar perfil, dados exibidos são atualizados.
- Após editar perfil, AuthContext é atualizado se armazenar usuário.

## Feedbacks e erros

- Toda ação de sucesso relevante exibe toast de sucesso.
- Todo erro de API relevante exibe toast de erro.
- Erros de validação são apresentados de forma amigável.
- Erros de rede são apresentados de forma amigável.
- Erro `401` encerra sessão e redireciona para `/login`.
- Erro `403` não causa logout automaticamente.
- Erro `404` remove ou atualiza item inexistente quando aplicável.
- Botões de ação ficam desabilitados durante requisições.
- A aplicação nunca exibe `passwordHash`.
- A aplicação nunca solicita upload de imagem.
- A aplicação não implementa recuperação de senha nesta versão.
- A aplicação não implementa notificações, websocket, chat, paginação avançada ou compartilhamento persistido.
