import type { FastifyInstance, FastifySchema } from "fastify";

type Params = {
  userId: string;
  recipeBookId: string;
};

const schema: FastifySchema = {
  params: {
    type: "object",
    required: ["userId", "recipeBookId"],
    properties: {
      userId: { type: "string" },
      recipeBookId: { type: "string" },
    },
  },
};

const RemoveUserAsEditor = async (
  fastify: FastifyInstance,
  recipeBookId: string,
  userId: string
): Promise<void> => {
  await fastify.pg.query(
    `
		DELETE FROM book_editors
		WHERE recipe_book_id = $1
		AND user_id = $2;
		`,
    [recipeBookId, userId]
  );
};

export default async function (fastify: FastifyInstance) {
  fastify.delete<{ Params: Params }>(
    "/",
    {
      schema,
      onRequest: [
        fastify.jwtAuth,
        fastify.userAccessAuth,
        fastify.recipeBookAccessAuth,
      ],
    },
    async (request, reply) => {
      try {
        await RemoveUserAsEditor(
          fastify,
          request.params.recipeBookId,
          request.params.userId
        );

        return reply.status(200).send();
      } catch (error) {
        fastify.log.error(error);
        const errorResponse: FamilyRecipes.Error = {
          message:
            "Something went wrong when trying to remove you as an editor from the recipe book.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
