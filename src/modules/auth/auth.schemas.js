const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Nome e obrigatorio."),
    email: z.string().trim().email("Email invalido.").toLowerCase(),
    password: z.string().min(6, "Senha deve ter no minimo 6 caracteres."),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Email invalido.").toLowerCase(),
    password: z.string().min(1, "Senha e obrigatoria."),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
