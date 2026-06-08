const { z } = require("zod");

const idParam = z.coerce.number().int().positive();
const content = z.string().trim().min(1, "Conteudo e obrigatorio.").max(1000, "Conteudo deve ter no maximo 1000 caracteres.");

const createPostSchema = z.object({
  body: z.object({
    content,
  }),
});

const updatePostSchema = z.object({
  params: z.object({
    id: idParam,
  }),
  body: z.object({
    content,
  }),
});

const deletePostSchema = z.object({
  params: z.object({
    id: idParam,
  }),
});

const listUserPostsSchema = z.object({
  params: z.object({
    userId: idParam,
  }),
});

module.exports = {
  createPostSchema,
  updatePostSchema,
  deletePostSchema,
  listUserPostsSchema,
};
