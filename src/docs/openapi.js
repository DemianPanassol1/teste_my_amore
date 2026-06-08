const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Simple Social API",
    version: "1.0.0",
    description: "API REST didatica para uma rede social simples, estilo Facebook simplificado.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local",
    },
  ],
  tags: [
    { name: "Auth", description: "Cadastro, login e usuario logado" },
    { name: "Users", description: "Consulta de usuarios" },
    { name: "Friendships", description: "Solicitacoes e amigos" },
    { name: "Posts", description: "Posts e feed" },
    { name: "Comments", description: "Comentarios" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "object" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string", example: "Verifique os dados enviados." },
              details: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    path: { type: "string", example: "body.email" },
                    message: { type: "string", example: "Email invalido." },
                  },
                },
              },
            },
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Ana Souza" },
          email: { type: "string", example: "ana@example.com" },
          createdAt: { type: "string", example: "2026-06-08 12:00:00" },
          updatedAt: { type: "string", example: "2026-06-08 12:00:00" },
          mutualFriendsCount: { type: "integer", example: 2 },
        },
      },
      Friendship: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          requesterId: { type: "integer", example: 1 },
          addresseeId: { type: "integer", example: 2 },
          status: { type: "string", enum: ["pending", "accepted", "rejected"], example: "pending" },
          createdAt: { type: "string", example: "2026-06-08 12:00:00" },
          updatedAt: { type: "string", example: "2026-06-08 12:00:00" },
          mutualFriendsCount: { type: "integer", example: 2 },
        },
      },
      Post: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          authorId: { type: "integer", example: 1 },
          content: { type: "string", example: "Meu primeiro post!" },
          createdAt: { type: "string", example: "2026-06-08 12:00:00" },
          updatedAt: { type: "string", example: "2026-06-08 12:00:00" },
          author: { $ref: "#/components/schemas/PublicAuthor" },
          comments: {
            type: "array",
            items: { $ref: "#/components/schemas/Comment" },
          },
        },
      },
      Comment: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          postId: { type: "integer", example: 1 },
          authorId: { type: "integer", example: 2 },
          content: { type: "string", example: "Muito bom!" },
          createdAt: { type: "string", example: "2026-06-08 12:00:00" },
          updatedAt: { type: "string", example: "2026-06-08 12:00:00" },
          author: { $ref: "#/components/schemas/PublicAuthor" },
        },
      },
      PublicAuthor: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Ana Souza" },
          email: { type: "string", example: "ana@example.com" },
        },
      },
      RegisterBody: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Ana Souza" },
          email: { type: "string", example: "ana@example.com" },
          password: { type: "string", minLength: 6, example: "123456" },
        },
      },
      LoginBody: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "ana@example.com" },
          password: { type: "string", example: "123456" },
        },
      },
      ContentBody: {
        type: "object",
        required: ["content"],
        properties: {
          content: { type: "string", minLength: 1, maxLength: 500, example: "Texto do post ou comentario." },
        },
      },
      UpdateProfileBody: {
        type: "object",
        properties: {
          name: { type: "string", example: "Marina Costa" },
          email: { type: "string", example: "marina.costa@example.com" },
        },
      },
      ProfileData: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          stats: {
            type: "object",
            properties: {
              postsCount: { type: "integer", example: 1 },
              friendsCount: { type: "integer", example: 2 },
              commentsCount: { type: "integer", example: 0 },
            },
          },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "Token ausente, invalido ou expirado.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: {
              success: false,
              error: { code: "UNAUTHORIZED", message: "Token nao informado.", details: [] },
            },
          },
        },
      },
      Forbidden: {
        description: "Usuario autenticado nao tem permissao.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      NotFound: {
        description: "Recurso nao encontrado.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      ValidationError: {
        description: "Erro de validacao.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Conflict: {
        description: "Conflito de regra de negocio.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Cria usuario",
        description: "Cria um usuario e retorna os dados publicos com um token JWT.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterBody" } } },
        },
        responses: {
          201: {
            description: "Usuario criado.",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    user: { id: 1, name: "Ana Souza", email: "ana@example.com", createdAt: "2026-06-08 12:00:00", updatedAt: "2026-06-08 12:00:00" },
                    token: "jwt.token.example",
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Autentica usuario",
        description: "Valida email e senha e retorna os dados publicos com um token JWT.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginBody" } } },
        },
        responses: {
          200: { description: "Login realizado.", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Retorna usuario logado",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Usuario logado.", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users"],
        summary: "Lista usuarios",
        description: "Lista usuarios cadastrados, exceto o proprio usuario, incluindo relacionamento de amizade e amigos em comum. Aceita busca opcional por nome ou email.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "search",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Busca parcial por nome ou email.",
            example: "marina",
          },
        ],
        responses: {
          200: { description: "Lista de usuarios.", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/users/me": {
      put: {
        tags: ["Users"],
        summary: "Atualiza perfil do usuario logado",
        description: "Permite atualizar name e email do proprio usuario. Nao altera senha.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateProfileBody" } } },
        },
        responses: {
          200: {
            description: "Perfil atualizado.",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    id: 1,
                    name: "Marina Costa",
                    email: "marina.costa@example.com",
                    createdAt: "2026-06-08 12:00:00",
                    updatedAt: "2026-06-08 12:10:00",
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/Unauthorized" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/users/me/profile": {
      get: {
        tags: ["Users"],
        summary: "Retorna perfil agregado do usuario logado",
        description: "Retorna dados publicos do usuario e estatisticas de posts, amigos e comentarios feitos pelo usuario.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Perfil agregado.",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    user: { id: 1, name: "Marina Costa", email: "marina.costa@example.com", createdAt: "2026-06-08 12:00:00", updatedAt: "2026-06-08 12:00:00" },
                    stats: { postsCount: 1, friendsCount: 2, commentsCount: 0 },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Busca usuario publico",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Usuario encontrado.", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/friendships/request/{userId}": {
      post: {
        tags: ["Friendships"],
        summary: "Envia solicitacao de amizade",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          201: { description: "Solicitacao criada.", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/friendships/requests": {
      get: {
        tags: ["Friendships"],
        summary: "Lista solicitacoes recebidas pendentes",
        description: "Cada solicitacao inclui mutualFriendsCount calculado entre o usuario logado e o solicitante.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Solicitacoes recebidas.", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/friendships/sent": {
      get: {
        tags: ["Friendships"],
        summary: "Lista solicitacoes enviadas pendentes",
        description: "Cada solicitacao inclui mutualFriendsCount calculado entre o usuario logado e o destinatario.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Solicitacoes enviadas.", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/friendships/{id}/accept": {
      post: {
        tags: ["Friendships"],
        summary: "Aceita solicitacao recebida",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Solicitacao aceita.", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/friendships/{id}/reject": {
      post: {
        tags: ["Friendships"],
        summary: "Recusa solicitacao recebida",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Solicitacao recusada.", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/friendships/friends": {
      get: {
        tags: ["Friendships"],
        summary: "Lista amigos aceitos",
        description: "Lista amigos aceitos com mutualFriendsCount quando aplicavel.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Lista de amigos.", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/friendships/{id}": {
      delete: {
        tags: ["Friendships"],
        summary: "Remove amizade aceita",
        description: "Apenas usuarios envolvidos podem remover uma amizade com status accepted.",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "Amizade removida.",
            content: {
              "application/json": {
                example: { success: true, data: { deleted: true } },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/posts": {
      post: {
        tags: ["Posts"],
        summary: "Cria post",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ContentBody" } } },
        },
        responses: {
          201: { description: "Post criado.", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/posts/feed": {
      get: {
        tags: ["Posts"],
        summary: "Lista feed",
        description: "Lista posts do usuario logado e de amigos aceitos, com autor e comentarios.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Feed carregado.", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/posts/user/{userId}": {
      get: {
        tags: ["Posts"],
        summary: "Lista posts de um usuario",
        description: "Se nao for o proprio usuario, exige amizade aceita.",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Posts do usuario.", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/posts/{id}": {
      put: {
        tags: ["Posts"],
        summary: "Atualiza post proprio",
        description: "Conteudo deve ter de 1 a 500 caracteres.",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ContentBody" } } },
        },
        responses: {
          200: { description: "Post atualizado.", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Posts"],
        summary: "Exclui post proprio",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Post excluido.", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/posts/{postId}/comments": {
      post: {
        tags: ["Comments"],
        summary: "Cria comentario em post permitido",
        description: "Permite comentar em post proprio ou de amigo aceito.",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "postId", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ContentBody" } } },
        },
        responses: {
          201: { description: "Comentario criado.", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/comments/{id}": {
      delete: {
        tags: ["Comments"],
        summary: "Exclui comentario proprio",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Comentario excluido.", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
