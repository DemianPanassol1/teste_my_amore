# Visão Geral da Arquitetura

Este documento define a arquitetura recomendada para o Front-End do Vínculo. Ele complementa a especificação funcional, orientando como organizar o projeto React antes da implementação.

O objetivo da arquitetura é manter o código simples, didático e previsível para um desenvolvedor júnior/intermediário. Cada parte da aplicação deve ter uma responsabilidade clara:

- Páginas coordenam fluxos de tela.
- Componentes reutilizáveis exibem partes da interface.
- Contexts guardam estado compartilhado.
- Services concentram chamadas HTTP.
- Utils concentram funções auxiliares.
- SCSS Modules mantêm estilos próximos ao componente.

O Front-End deve conversar com a API exclusivamente por meio da camada `services/`. Nenhum componente ou página deve chamar `fetch` diretamente. Isso evita duplicação de headers, tratamento de erros espalhado e regras de autenticação inconsistentes.

Fluxo geral:

```text
Usuário
→ Página
→ Context
→ Service
→ API
→ Service
→ Context ou estado local
→ Página
```

Nem todo fluxo precisa passar por Context. Dados usados apenas por uma página podem ir diretamente de Página para Service e voltar para estado local. O Context deve ser usado quando o estado precisa ser compartilhado entre rotas ou componentes distantes.

# Estrutura de Pastas

Estrutura recomendada para React + Vite + JavaScript + JSX + SCSS Modules:

```text
src/
├── assets/
├── components/
│   ├── Button/
│   ├── Input/
│   ├── Textarea/
│   ├── Avatar/
│   ├── Card/
│   ├── Loader/
│   ├── EmptyState/
│   ├── Navbar/
│   ├── PostCard/
│   ├── CommentList/
│   ├── CommentForm/
│   ├── UserCard/
│   └── ProfileStats/
├── contexts/
│   ├── AuthContext.jsx
│   └── UserContext.jsx
├── hooks/
├── layouts/
│   ├── AuthLayout/
│   └── AppLayout/
├── pages/
│   ├── Login/
│   ├── Register/
│   ├── Feed/
│   ├── Friends/
│   ├── FriendRequests/
│   └── Profile/
├── routes/
├── services/
├── utils/
├── constants/
├── styles/
├── App.jsx
└── main.jsx
```

## `assets/`

Deve armazenar recursos estáticos, como imagens, ícones locais ou arquivos que não sejam código. Como o projeto não possui upload nem avatar persistido, esta pasta deve ser usada com moderação.

## `components/`

Deve conter componentes reutilizáveis. Todo componente compartilhado deve seguir o padrão:

```text
ComponentName/
├── ComponentName.jsx
├── ComponentName.module.scss
└── index.js
```

O `index.js` deve importar e exportar o componente principal:

```js
import ComponentName from './ComponentName';

export default ComponentName;
```

Esse padrão facilita imports limpos e mantém JSX e SCSS próximos.

## `contexts/`

Deve conter Context API. Nesta aplicação, os contexts previstos são:

- `AuthContext.jsx`
- `UserContext.jsx`

Contexts não devem virar um lugar genérico para qualquer estado. Devem guardar apenas dados realmente compartilhados.

## `hooks/`

Deve conter hooks reutilizáveis criados pelo projeto.

Exemplos possíveis:

- `useAuth`
- `useUsers`
- `useDebounce`
- `useForm`

Hooks devem iniciar com `use` e podem encapsular acesso a Context ou comportamentos repetidos.

## `layouts/`

Deve conter estruturas comuns de tela.

`AuthLayout/` deve ser usado para páginas públicas, como Login e Register.

`AppLayout/` deve ser usado para páginas autenticadas, com Navbar e estrutura comum das rotas internas.

Cada layout pode seguir o mesmo padrão dos componentes:

```text
AppLayout/
├── AppLayout.jsx
├── AppLayout.module.scss
└── index.js
```

## `pages/`

Deve conter páginas roteáveis. Cada página representa uma rota principal.

Padrão recomendado:

```text
Feed/
├── Feed.jsx
├── Feed.module.scss
└── index.js
```

Páginas podem importar componentes, contexts e services. Elas coordenam carregamento, estado local e eventos da tela.

## `routes/`

Deve conter a configuração de rotas da aplicação.

Responsabilidades:

- Declarar rotas públicas.
- Declarar rotas privadas.
- Implementar `ProtectedRoute`.
- Implementar regra para impedir usuário autenticado em `/login` e `/register`.

## `services/`

Deve conter todas as chamadas HTTP.

Nenhum componente deve chamar `fetch` diretamente. Sempre criar ou usar uma função em `services/`.

## `utils/`

Deve conter funções auxiliares puras ou de baixo acoplamento.

Exemplos:

- Formatar datas.
- Gerar iniciais de nome.
- Normalizar mensagens de erro.
- Validar e-mail em formulário.

## `constants/`

Deve conter valores fixos compartilhados.

Exemplos:

- Chaves de storage.
- Rotas.
- Limites de caracteres.
- Mensagens padrão.

## `styles/`

Deve conter estilos globais mínimos, variáveis e mixins SCSS.

Não deve virar um lugar para estilos específicos de componentes.

## `App.jsx`

Deve montar providers globais, roteamento principal e componentes globais como `ToastContainer`.

## `main.jsx`

Deve ser o ponto de entrada do Vite, renderizando a aplicação React.

# Estratégia de Roteamento

O projeto deve usar React Router.

Rotas esperadas:

```text
/login
/register
/feed
/friends
/friend-requests
/profile
```

## Rotas públicas

Rotas públicas:

- `/login`
- `/register`

Elas devem ser acessíveis apenas para usuários não autenticados. Se um usuário autenticado tentar acessar uma dessas rotas, deve ser redirecionado para `/feed`.

## Rotas privadas

Rotas privadas:

- `/feed`
- `/friends`
- `/friend-requests`
- `/profile`

Essas rotas exigem token válido. Se não houver token, redirecionar para `/login`.

## `ProtectedRoute`

O `ProtectedRoute` deve proteger rotas internas.

Responsabilidades:

- Verificar se existe autenticação.
- Considerar o estado `isCheckingAuth`.
- Evitar renderizar página protegida enquanto a sessão está sendo validada.
- Redirecionar para `/login` quando não houver sessão.

## Bloqueio de `/login` e `/register` para autenticados

Deve existir um mecanismo equivalente a `PublicRoute` ou uma verificação nas próprias rotas públicas.

Comportamento:

- Se `isAuthenticated` for `true`, redirecionar para `/feed`.
- Se `isCheckingAuth` estiver ativo, aguardar validação antes de decidir.
- Se não houver sessão, renderizar Login ou Register normalmente.

# Estratégia de Autenticação

A autenticação deve ser centralizada em `AuthContext`.

## Token

O token JWT deve ser salvo em `localStorage`.

Chave sugerida:

```text
vinculo:token
```

Essa chave deve ser definida em `constants/`, evitando strings repetidas.

## Persistência de sessão

Ao abrir a aplicação:

1. Ler token do `localStorage`.
2. Se não houver token, considerar usuário não autenticado.
3. Se houver token, chamar `GET /auth/me`.
4. Se a API retornar usuário, manter sessão.
5. Se a API retornar `401`, limpar sessão.

## Funções esperadas no `AuthContext`

```text
login(email, password)
register(name, email, password)
logout()
checkSession()
updateAuthenticatedUser(user)
```

## `login(email, password)`

Deve ser chamada pela página Login.

Responsabilidades:

- Chamar `auth.service.js`.
- Receber usuário e token.
- Salvar token no `localStorage`.
- Atualizar estado `user`.
- Atualizar estado `token`.
- Marcar usuário como autenticado.

## `register(name, email, password)`

Deve ser chamada pela página Register.

Responsabilidades:

- Chamar `auth.service.js`.
- Receber usuário e token.
- Salvar token no `localStorage`.
- Atualizar estado global.
- Autenticar usuário automaticamente.

## `logout()`

Deve ser chamada ao clicar em "Sair" ou quando a sessão expirar.

Responsabilidades:

- Remover token do `localStorage`.
- Limpar `user`.
- Limpar `token`.
- Redirecionar para `/login`.

Logout não deve chamar API.

## `checkSession()`

Deve ser chamada na inicialização da aplicação, normalmente dentro de um `useEffect` do provider de autenticação.

Responsabilidades:

- Validar token salvo.
- Popular usuário logado com `GET /auth/me`.
- Controlar `isCheckingAuth`.
- Encerrar sessão em caso de token inválido.

## `updateAuthenticatedUser(user)`

Deve ser chamada após edição de perfil bem-sucedida.

Responsabilidade:

- Atualizar os dados públicos do usuário logado no estado global, especialmente `name` e `email`.

# Estratégia de Consumo da API

Nenhum componente ou página deve chamar `fetch` diretamente.

Todas as chamadas HTTP devem ficar em `services/`.

Estrutura sugerida:

```text
src/services/
├── api.js
├── auth.service.js
├── users.service.js
├── friendships.service.js
├── posts.service.js
└── profile.service.js
```

## `api.js`

Responsabilidades:

- Centralizar `baseURL`.
- Montar URL final.
- Montar headers.
- Incluir `Content-Type: application/json` quando houver body JSON.
- Anexar `Authorization: Bearer TOKEN` quando necessário.
- Converter respostas em JSON.
- Identificar erro de rede.
- Normalizar erros da API.

`api.js` deve oferecer funções auxiliares para requisições autenticadas e públicas. O token pode ser recebido como argumento ou lido de um storage/helper centralizado. O importante é evitar repetição manual em cada service.

## Services específicos

`auth.service.js` deve expor funções relacionadas a autenticação:

```text
login(email, password)
register(name, email, password)
getMe(token)
```

`users.service.js` deve expor funções relacionadas a usuários:

```text
getUsers({ search })
updateMe(data)
```

`friendships.service.js` deve expor funções relacionadas a amizades:

```text
sendFriendRequest(userId)
getReceivedRequests()
getSentRequests()
acceptFriendship(friendshipId)
rejectFriendship(friendshipId)
removeFriendship(friendshipId)
getFriends()
```

`posts.service.js` deve expor funções relacionadas a posts e comentários:

```text
getFeed()
createPost(content)
getUserPosts(userId)
updatePost(postId, content)
deletePost(postId)
createComment(postId, content)
deleteComment(commentId)
```

`profile.service.js` deve expor funções do perfil:

```text
getMyProfile()
```

Se preferir, `getMyProfile` pode ficar em `users.service.js`. A separação em `profile.service.js` é útil quando a tela de perfil crescer.

# Estratégia de Context API

Context API deve ser usada para estados compartilhados.

## AuthContext

Responsabilidades:

- Guardar usuário autenticado.
- Guardar token.
- Informar se a sessão está carregando.
- Informar se há usuário autenticado.
- Expor métodos de login, cadastro, logout e atualização do usuário.

Estado recomendado:

```text
user
token
isAuthenticated
isCheckingAuth
```

O `AuthContext` deve ser o único lugar que decide se a sessão está ativa.

## UserContext

Responsabilidades possíveis:

- Guardar lista de usuários.
- Guardar termo de busca.
- Carregar usuários.
- Enviar solicitação de amizade.
- Aceitar solicitação.
- Recusar solicitação.
- Remover amizade.
- Atualizar localmente o status de amizade após ações.

O `UserContext` é recomendado porque a lista de usuários, busca e estados de amizade podem aparecer em mais de uma página ou componente.

## O que não deve ir para Context

Não colocar em Context:

- Texto digitado em formulário.
- Texto de comentário.
- Loading individual de botão.
- Estado de modal.
- Campos temporários de edição.
- Mensagens de erro específicas de um formulário.
- Filtro visual usado apenas em uma página.

Esses dados devem ficar em `useState` local, próximos do componente ou página que os utiliza.

# Estratégia de Estado

## `useState`

Usar para estado local e temporário.

Exemplos:

- `email` e `password` na tela Login.
- `name`, `email`, `password` e `confirmPassword` na tela Register.
- Texto do novo post no Feed.
- Texto do comentário de cada post.
- Loading de botão específico.
- Filtro selecionado em Friends.
- Campos de edição no Profile.

## `useEffect`

Usar para efeitos de ciclo de vida e carregamento inicial.

Exemplos:

- Chamar `checkSession` quando a aplicação iniciar.
- Carregar feed ao montar a página Feed.
- Carregar usuários ao abrir Friends.
- Carregar solicitações ao abrir FriendRequests.
- Carregar perfil e posts ao abrir Profile.

Evitar colocar lógica complexa diretamente dentro do `useEffect`. Quando o carregamento tiver muitas etapas, criar uma função dentro da página ou usar função do Context.

## `useMemo`

Usar para valores derivados que podem ser recalculados com frequência.

Exemplos:

- Lista filtrada de amigos a partir de `users`.
- Contagem de caracteres restante.
- Separação de usuários por status de amizade.
- Verificação derivada de formulário válido.

Não usar `useMemo` por padrão. Usar quando deixar o código mais claro ou evitar cálculo repetido relevante.

## `useCallback`

Usar quando uma função é passada para componentes filhos e pode causar re-renderizações desnecessárias, ou quando a função participa de dependências de hooks.

Exemplos:

- Função `handleCreateComment` passada para vários `PostCard`.
- Função `handleFriendAction` passada para `UserCard`.

Não usar em todos os handlers automaticamente. Priorizar clareza.

## Context API

Usar quando o estado precisa sobreviver à troca de páginas ou ser consumido por vários pontos da árvore.

Exemplos:

- Usuário autenticado.
- Token.
- Lista compartilhada de usuários e amizade.

# Estrutura das Páginas

## Login

Responsabilidade:

- Exibir formulário de entrada.
- Validar campos.
- Chamar autenticação.
- Redirecionar para `/feed`.

Contexts usados:

- `AuthContext`.

Services usados:

- Indiretamente `auth.service.js`, por meio do `AuthContext`.

Componentes usados:

- `Input`.
- `Button`.
- `AuthLayout`.

Estados locais esperados:

- `email`.
- `password`.
- `errors`.
- `isSubmitting`.

Dados carregados:

- Nenhum carregamento inicial próprio, além da validação global de sessão.

Fluxo de carregamento:

- Loading apenas no botão `Entrar`.

Fluxo de erro:

- Erros locais próximos aos campos.
- Erros da API em toast.

## Register

Responsabilidade:

- Exibir formulário de cadastro.
- Validar nome, e-mail, senha e confirmação.
- Criar conta.
- Autenticar automaticamente após sucesso.

Contexts usados:

- `AuthContext`.

Services usados:

- Indiretamente `auth.service.js`, por meio do `AuthContext`.

Componentes usados:

- `Input`.
- `Button`.
- `AuthLayout`.

Estados locais esperados:

- `name`.
- `email`.
- `password`.
- `confirmPassword`.
- `errors`.
- `isSubmitting`.

Dados carregados:

- Nenhum dado inicial próprio.

Fluxo de carregamento:

- Loading no botão de cadastro.

Fluxo de erro:

- Validações locais antes de chamar API.
- Toast para erro de API.

## Feed

Responsabilidade:

- Carregar feed.
- Criar posts.
- Exibir comentários.
- Criar comentários.

Contexts usados:

- `AuthContext`, para usuário/token.

Services usados:

- `posts.service.js`.
- Opcionalmente `users.service.js` se a tela exibir sugestões usando usuários.
- Opcionalmente `friendships.service.js` para enviar solicitação a partir de sugestão.

Componentes usados:

- `Navbar`.
- `Textarea`.
- `Button`.
- `Loader`.
- `EmptyState`.
- `PostCard`.
- `CommentList`.
- `CommentForm`.
- `Avatar`.
- `Card`.

Estados locais esperados:

- `posts`.
- `newPostContent`.
- `isLoadingFeed`.
- `isCreatingPost`.
- `commentDrafts`, por `postId`.
- `commentLoadingByPostId`.

Dados carregados:

- `GET /posts/feed`.

Fluxo de carregamento:

- Loading de página para feed inicial.
- Loading de botão para publicação.
- Loading por post para comentário.

Fluxo de erro:

- Toast em falha de carregamento, criação de post ou comentário.
- Logout automático em `401`.

## Friends

Responsabilidade:

- Listar usuários.
- Buscar usuários.
- Filtrar por status.
- Enviar solicitações.
- Aceitar ou recusar solicitações recebidas.
- Remover amizade aceita.

Contexts usados:

- `AuthContext`.
- `UserContext`.

Services usados:

- Indiretamente `users.service.js` e `friendships.service.js` via `UserContext`.

Componentes usados:

- `Navbar`.
- `Input`.
- `Button`.
- `Loader`.
- `EmptyState`.
- `UserCard`.
- `Avatar`.
- `Card`.

Estados locais esperados:

- `selectedFilter`.
- Loading por card, se não ficar no `UserContext`.
- Controle local do input de busca, se a busca não for centralizada.

Dados carregados:

- `GET /users`.
- `GET /users?search=texto`.

Fluxo de carregamento:

- Loading de lista.
- Loading por ação individual.

Fluxo de erro:

- Toast para falha de listagem.
- Toast para erro em ação de amizade.

## FriendRequests

Responsabilidade:

- Carregar solicitações recebidas.
- Aceitar solicitações.
- Recusar solicitações.
- Atualizar lista após resposta.

Contexts usados:

- `AuthContext`.
- Pode usar `UserContext` se ações de amizade estiverem centralizadas.

Services usados:

- `friendships.service.js`.

Componentes usados:

- `Navbar`.
- `Loader`.
- `EmptyState`.
- `UserCard`.
- `Avatar`.
- `Button`.
- `Card`.

Estados locais esperados:

- `requests`.
- `isLoading`.
- `actionLoadingByRequestId`.

Dados carregados:

- `GET /friendships/requests`.

Fluxo de carregamento:

- Loading inicial para lista.
- Loading por solicitação durante aceitar/recusar.

Fluxo de erro:

- Toast para falha no carregamento.
- Toast para falha ao aceitar ou recusar.

## Profile

Responsabilidade:

- Carregar dados agregados do perfil.
- Carregar posts próprios.
- Permitir comentários nos próprios posts.
- Permitir edição de nome e e-mail.

Contexts usados:

- `AuthContext`.

Services usados:

- `profile.service.js`.
- `posts.service.js`.
- `users.service.js`.

Componentes usados:

- `Navbar`.
- `ProfileStats`.
- `PostCard`.
- `CommentList`.
- `CommentForm`.
- `Input`.
- `Button`.
- `Loader`.
- `EmptyState`.
- `Avatar`.
- `Card`.

Estados locais esperados:

- `profile`.
- `posts`.
- `isLoadingProfile`.
- `isLoadingPosts`.
- `isEditing`.
- `editName`.
- `editEmail`.
- `isSavingProfile`.
- `commentDrafts`.
- `commentLoadingByPostId`.

Dados carregados:

- `GET /users/me/profile`.
- `GET /posts/user/:userId`.

Fluxo de carregamento:

- Loading para perfil.
- Loading para posts.
- Loading para salvar perfil.
- Loading por comentário.

Fluxo de erro:

- Toast para falha ao carregar perfil.
- Toast para falha ao carregar posts.
- Toast para falha ao salvar.
- Atualizar `AuthContext` após edição bem-sucedida.

# Componentes Compartilhados

Todo componente compartilhado deve seguir:

```text
ComponentName/
├── ComponentName.jsx
├── ComponentName.module.scss
└── index.js
```

## Button

Responsabilidade:

- Renderizar botões reutilizáveis.
- Receber estado `disabled`.
- Receber estado de loading.
- Evitar duplicação de estilo e comportamento básico.

Estrutura:

```text
Button/
├── Button.jsx
├── Button.module.scss
└── index.js
```

## Input

Responsabilidade:

- Renderizar campos de texto, e-mail e senha.
- Exibir label e erro quando necessário.
- Padronizar comportamento visual de inputs.

Estrutura:

```text
Input/
├── Input.jsx
├── Input.module.scss
└── index.js
```

## Textarea

Responsabilidade:

- Renderizar áreas de texto para posts e comentários.
- Apoiar contador de caracteres quando necessário.

Estrutura:

```text
Textarea/
├── Textarea.jsx
├── Textarea.module.scss
└── index.js
```

## Avatar

Responsabilidade:

- Exibir iniciais do usuário.
- Não depender de imagem persistida.

Estrutura:

```text
Avatar/
├── Avatar.jsx
├── Avatar.module.scss
└── index.js
```

## Card

Responsabilidade:

- Fornecer contêiner reutilizável para posts, usuários e blocos de conteúdo.

Estrutura:

```text
Card/
├── Card.jsx
├── Card.module.scss
└── index.js
```

## Loader

Responsabilidade:

- Indicar carregamento de página, bloco ou ação.

Estrutura:

```text
Loader/
├── Loader.jsx
├── Loader.module.scss
└── index.js
```

## EmptyState

Responsabilidade:

- Exibir mensagens amigáveis quando listas estiverem vazias.

Estrutura:

```text
EmptyState/
├── EmptyState.jsx
├── EmptyState.module.scss
└── index.js
```

## Navbar

Responsabilidade:

- Exibir navegação principal autenticada.
- Exibir ação de logout.
- Indicar rota ativa.

Estrutura:

```text
Navbar/
├── Navbar.jsx
├── Navbar.module.scss
└── index.js
```

## PostCard

Responsabilidade:

- Exibir dados do post.
- Exibir autor.
- Exibir conteúdo.
- Exibir comentários e formulário de comentário por composição.

Estrutura:

```text
PostCard/
├── PostCard.jsx
├── PostCard.module.scss
└── index.js
```

## CommentList

Responsabilidade:

- Renderizar lista de comentários de um post.
- Exibir estado vazio quando não houver comentários.

Estrutura:

```text
CommentList/
├── CommentList.jsx
├── CommentList.module.scss
└── index.js
```

## CommentForm

Responsabilidade:

- Controlar envio visual de um comentário.
- Receber valor, callbacks e loading da página ou do `PostCard`.

Estrutura:

```text
CommentForm/
├── CommentForm.jsx
├── CommentForm.module.scss
└── index.js
```

## UserCard

Responsabilidade:

- Exibir usuário em listas de amigos, sugestões ou solicitações.
- Mostrar status de amizade.
- Mostrar ações disponíveis conforme estado.
- Mostrar amigos em comum quando disponível.

Estrutura:

```text
UserCard/
├── UserCard.jsx
├── UserCard.module.scss
└── index.js
```

## ProfileStats

Responsabilidade:

- Exibir estatísticas do perfil: posts, amigos e comentários.

Estrutura:

```text
ProfileStats/
├── ProfileStats.jsx
├── ProfileStats.module.scss
└── index.js
```

# Estratégia de SCSS Modules

Cada componente e página deve ter seu próprio `.module.scss`.

Exemplo de uso:

```text
Button.module.scss
Button.jsx usando styles.button
```

Regras:

- Evitar CSS global desnecessário.
- Usar `styles.nomeDaClasse`.
- Evitar nomes genéricos demais, como `.box` ou `.text`, quando o contexto não estiver claro.
- Manter estilos próximos do componente.
- Evitar CSS inline.
- Evitar duplicar estilos entre componentes quando um componente compartilhado resolver o caso.

Estrutura global sugerida:

```text
src/styles/
├── _variables.scss
├── _mixins.scss
├── _reset.scss
└── global.scss
```

## `_variables.scss`

Deve conter tokens globais:

- Cores.
- Fontes.
- Espaçamentos.
- Raios de borda.
- Sombras.
- Durações de transição.

## `_mixins.scss`

Deve conter reutilizações:

- Media queries.
- Helpers de alinhamento.
- Truncamento de texto.

## `_reset.scss`

Deve normalizar comportamento básico do navegador:

- `box-sizing`.
- Margens padrão.
- Fontes base.
- Estilo básico de botões e inputs.

## `global.scss`

Deve importar reset, variáveis e estilos globais mínimos.

Não deve conter estilos específicos de páginas ou componentes.

# Estratégia de Tratamento de Erros

Services devem capturar e normalizar erros antes de retorná-los para páginas ou contexts.

## Erro da API

Quando a API retornar:

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

O service deve preservar:

- `code`
- `message`
- `details`
- `status`

A página ou context deve exibir `message` com React Toastify quando for erro geral.

## Erro `401`

Quando ocorrer `401`:

- Encerrar sessão pelo `AuthContext`.
- Remover token.
- Redirecionar para `/login`.
- Exibir toast de sessão expirada quando adequado.

## Erro de validação

Erros `400` devem ser usados para orientar formulário.

Se houver `details`, a página pode mostrar erros por campo. Se não houver mapeamento por campo, exibir toast.

## Erro de rede

Quando `fetch` falhar sem resposta HTTP:

- Exibir mensagem de conexão.
- Permitir nova tentativa.
- Não fazer logout.

## Erro inesperado

Exibir mensagem genérica e manter detalhes técnicos fora da interface.

# Estratégia de Loading

Loading deve ser proporcional ao escopo da requisição.

## Loading de página

Usar quando a página depende de dados iniciais.

Exemplos:

- Feed carregando posts.
- Friends carregando usuários.
- FriendRequests carregando solicitações.
- Profile carregando dados agregados.

## Loading de botão

Usar em ações pontuais.

Exemplos:

- Login usa loading no botão `Entrar`.
- Cadastro usa loading no botão de cadastro.
- Criar post usa loading no botão `Publicar`.
- Editar perfil usa loading no botão de salvar.

## Loading por item

Usar quando uma lista tem ações independentes.

Exemplos:

- Comentário usa loading apenas no comentário daquele post.
- Aceitar solicitação desabilita apenas os botões daquela solicitação.
- Remover amizade desabilita apenas o card daquele usuário.
- Enviar solicitação desabilita apenas o botão daquele usuário.

## Loading de autenticação inicial

`checkSession` deve ter um loading global inicial.

Enquanto `isCheckingAuth` for verdadeiro:

- Não renderizar rotas protegidas.
- Não redirecionar prematuramente.
- Exibir indicador simples de carregamento.

# Estratégia de Dados e Contratos

Como o projeto usa JavaScript, não devem ser criados tipos TypeScript. Os formatos esperados devem ser documentados por exemplos JSON.

## User

```json
{
  "id": 1,
  "name": "Marina Costa",
  "email": "marina.costa@example.com",
  "createdAt": "2026-06-08 12:00:00",
  "updatedAt": "2026-06-08 12:00:00",
  "friendship": {
    "id": 10,
    "status": "accepted",
    "requesterId": 1,
    "addresseeId": 2
  },
  "mutualFriendsCount": 2
}
```

## AuthResponse

```json
{
  "user": {
    "id": 1,
    "name": "Marina Costa",
    "email": "marina.costa@example.com"
  },
  "token": "jwt"
}
```

## Post

```json
{
  "id": 1,
  "authorId": 1,
  "content": "Texto do post",
  "createdAt": "2026-06-08 12:00:00",
  "updatedAt": "2026-06-08 12:00:00",
  "author": {
    "id": 1,
    "name": "Marina Costa",
    "email": "marina.costa@example.com"
  },
  "comments": []
}
```

## Comment

```json
{
  "id": 1,
  "postId": 1,
  "authorId": 2,
  "content": "Comentário",
  "createdAt": "2026-06-08 12:00:00",
  "updatedAt": "2026-06-08 12:00:00",
  "author": {
    "id": 2,
    "name": "Lucas Almeida",
    "email": "lucas@example.com"
  }
}
```

## Friendship

```json
{
  "id": 1,
  "requesterId": 1,
  "addresseeId": 2,
  "status": "pending",
  "createdAt": "2026-06-08 12:00:00",
  "updatedAt": "2026-06-08 12:00:00",
  "mutualFriendsCount": 2
}
```

## ProfileStats

```json
{
  "user": {
    "id": 1,
    "name": "Marina Costa",
    "email": "marina.costa@example.com"
  },
  "stats": {
    "postsCount": 1,
    "friendsCount": 2,
    "commentsCount": 0
  }
}
```

## ApiSuccessResponse

```json
{
  "success": true,
  "data": {}
}
```

## ApiErrorResponse

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

# Convenções do Projeto

- Componentes em PascalCase.
- Pastas de componentes em PascalCase.
- Pastas de páginas em PascalCase.
- Arquivos principais dos componentes em PascalCase.
- Arquivos principais de páginas em PascalCase.
- Funções e variáveis em camelCase.
- Hooks iniciando com `use`.
- Services terminando com `.service.js`.
- SCSS Modules terminando com `.module.scss`.
- Imports usando `index.js` quando existir.
- Constantes em camelCase ou UPPER_CASE quando forem valores realmente fixos.
- Não usar arquivos `.ts`.
- Não usar arquivos `.tsx`.
- Não criar interfaces TypeScript.

Exemplo de import preferido:

```js
import Button from '../../components/Button';
```

Em vez de:

```js
import Button from '../../components/Button/Button';
```

# Fluxos Arquiteturais

## Login

```text
Login Page
→ AuthContext.login(email, password)
→ auth.service.login
→ POST /auth/login
→ salvar token e user no AuthContext
→ toast de sucesso
→ redirecionar para /feed
```

## Cadastro

```text
Register Page
→ AuthContext.register(name, email, password)
→ auth.service.register
→ POST /auth/register
→ salvar token e user no AuthContext
→ toast de sucesso
→ redirecionar para /feed
```

## Validação de sessão

```text
App/AuthProvider
→ AuthContext.checkSession()
→ auth.service.getMe
→ GET /auth/me
→ atualizar user no AuthContext
→ liberar rotas protegidas
```

Em caso de `401`:

```text
GET /auth/me
→ erro 401
→ limpar token e user
→ redirecionar para /login
```

## Criar post

```text
Feed Page
→ posts.service.createPost(content)
→ POST /posts
→ atualizar lista local ou recarregar feed
→ limpar textarea
→ toast de sucesso
```

## Enviar comentário

```text
PostCard/CommentForm
→ Feed Page ou Profile Page handler
→ posts.service.createComment(postId, content)
→ POST /posts/:postId/comments
→ atualizar comentários do post
→ limpar campo
→ toast de sucesso
```

## Buscar usuários

```text
Friends Page
→ UserContext.loadUsers(search)
→ users.service.getUsers({ search })
→ GET /users?search=texto
→ atualizar lista de users no UserContext
→ renderizar cards
```

## Enviar solicitação

```text
UserCard
→ UserContext.sendFriendRequest(userId)
→ friendships.service.sendFriendRequest(userId)
→ POST /friendships/request/:userId
→ atualizar status do usuário na lista
→ toast de sucesso
```

## Aceitar solicitação

```text
FriendRequests Page ou Friends Page
→ UserContext.acceptFriendship(friendshipId)
→ friendships.service.acceptFriendship(friendshipId)
→ POST /friendships/:id/accept
→ remover solicitação ou atualizar usuário para accepted
→ toast de sucesso
```

## Remover amizade

```text
Friends Page
→ UserContext.removeFriendship(friendshipId)
→ friendships.service.removeFriendship(friendshipId)
→ DELETE /friendships/:id
→ atualizar lista para remover estado de amigo
→ toast de sucesso
```

## Editar perfil

```text
Profile Page
→ users.service.updateMe(data)
→ PUT /users/me
→ atualizar estado local do Profile
→ AuthContext.updateAuthenticatedUser(user)
→ toast de sucesso
```

## Logout

```text
Navbar
→ AuthContext.logout()
→ remover token do localStorage
→ limpar user e token
→ redirecionar para /login
```

# Requisitos Não Funcionais

## Responsividade

A aplicação deve funcionar em desktop e mobile de acordo com os designs aprovados. A arquitetura deve permitir ajustes responsivos via SCSS Modules e mixins globais.

## Componentização

Partes repetidas devem virar componentes reutilizáveis. Evitar duplicar botões, inputs, cards, loaders e estados vazios em cada página.

## Reutilização

Regras comuns devem ser centralizadas:

- Requisições HTTP em `services/`.
- Autenticação em `AuthContext`.
- Usuários e amizades compartilhados em `UserContext`.
- Constantes em `constants/`.
- Formatação em `utils/`.

## Separação de responsabilidades

Páginas não devem conter lógica de baixo nível de API. Componentes compartilhados não devem conhecer detalhes de endpoints. Services não devem cuidar de layout ou toast visual diretamente, salvo se a equipe decidir por um helper central de erro.

## Código didático

Preferir código explícito e simples a abstrações prematuras. Um desenvolvedor em aprendizado deve conseguir seguir o fluxo sem precisar entender padrões avançados.

## Evitar duplicação

Evitar repetir:

- Headers de autenticação.
- Parsing de resposta da API.
- Mensagens genéricas de erro.
- Estrutura de botões e inputs.
- Regras de limite de 500 caracteres.

## Evitar `fetch` dentro de componentes

Componentes e páginas devem usar services. Isso mantém o consumo da API previsível e testável.

## Evitar lógica de negócio espalhada

Regras como status de amizade, sessão expirada e limite de caracteres devem estar concentradas em helpers, contexts ou páginas responsáveis, não repetidas de forma divergente.

## Evitar CSS inline

Usar SCSS Modules. CSS inline deve ser evitado, exceto em casos pontuais e justificados.

## Não usar TypeScript

Este projeto deve usar JavaScript e JSX. Não criar `.ts`, `.tsx`, tipos ou interfaces TypeScript.

## Não usar Redux, Zustand ou MobX

O estado global deve ser resolvido com Context API. Estados locais devem ser resolvidos com hooks nativos do React.
