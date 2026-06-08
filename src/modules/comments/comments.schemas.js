const { z } = require("zod");

const idParam = z.coerce.number().int().positive();
const content = z.string().trim().min(1, "Conteudo e obrigatorio.").max(500, "Comentario deve ter no maximo 500 caracteres.");

const createCommentSchema = z.object({
  params: z.object({
    postId: idParam,
  }),
  body: z.object({
    content,
  }),
});

const deleteCommentSchema = z.object({
  params: z.object({
    id: idParam,
  }),
});

module.exports = {
  createCommentSchema,
  deleteCommentSchema,
};
