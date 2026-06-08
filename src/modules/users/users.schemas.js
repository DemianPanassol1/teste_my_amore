const { z } = require("zod");

const idParam = z.coerce.number().int().positive();

const showUserSchema = z.object({
  params: z.object({
    id: idParam,
  }),
});

module.exports = {
  showUserSchema,
};
