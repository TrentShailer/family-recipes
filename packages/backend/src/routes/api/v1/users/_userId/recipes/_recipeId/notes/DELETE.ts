import type { FastifyInstance, FastifyRequest, FastifySchema } from "fastify";

type Params = {
  userId: string;
  recipeId: string;
};

const schema: FastifySchema = {
  params: {
    type: "object",
    required: ["userId", "recipeId"],
    properties: {
      userId: { type: "string" },
      recipeId: { type: "string" },
    },
  },
};

const HasNotes = async (
  fastify: FastifyInstance,
  userId: string,
  recipeId: string
): Promise<boolean> => {
  const { rows } = await fastify.pg.query<{ id: string; note: string }>(
    `
		SELECT
			id, note
		FROM notes
		WHERE user_id = $1
		AND recipe_id = $2;
		`,
    [userId, recipeId]
  );

  return rows.length > 0;
};

const RemoveNotes = async (
  fastify: FastifyInstance,
  userId: string,
  recipeId: string
): Promise<void> => {
  await fastify.pg.query(
    `
		DELETE FROM notes
		WHERE user_id = $1
		AND recipe_id = $2;
		`,
    [userId, recipeId]
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
        fastify.recipeAccessAuth,
      ],
    },
    async (request, reply) => {
      try {
        const hasNotes = await HasNotes(
          fastify,
          request.user.userId,
          request.params.recipeId
        );

        if (!hasNotes) {
          const errorResponse: FamilyRecipes.Error = {
            message: "You have no notes for this recipe.",
            code: "404",
          };
          return reply.status(404).send(errorResponse);
        }

        await RemoveNotes(
          fastify,
          request.user.userId,
          request.params.recipeId
        );

        return reply.status(200).send();
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to delete your notes.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
