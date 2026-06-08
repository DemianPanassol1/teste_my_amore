const { z } = require("zod");

const idParam = z.coerce.number().int().positive();

const listUsersSchema = z.object({
  query: z.object({
    search: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || undefined),
  }),
});

const showUserSchema = z.object({
  params: z.object({
    id: idParam,
  }),
});

const updateMeSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(1, "Nome e obrigatorio.").optional(),
      email: z.string().trim().email("Email invalido.").toLowerCase().optional(),
    })
    .strict()
    .refine((data) => data.name !== undefined || data.email !== undefined, {
      message: "Informe name ou email para atualizar.",
    }),
});

module.exports = {
  listUsersSchema,
  showUserSchema,
  updateMeSchema,
};
