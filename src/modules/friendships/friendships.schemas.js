const { z } = require("zod");

const idParam = z.coerce.number().int().positive();

const requestFriendshipSchema = z.object({
  params: z.object({
    userId: idParam,
  }),
});

const friendshipActionSchema = z.object({
  params: z.object({
    id: idParam,
  }),
});

module.exports = {
  requestFriendshipSchema,
  friendshipActionSchema,
};
