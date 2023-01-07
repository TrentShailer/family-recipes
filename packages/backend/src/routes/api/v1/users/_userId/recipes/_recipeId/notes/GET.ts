import type { FastifyInstance, FastifySchema } from "fastify";

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

const GetNotes = async (
  fastify: FastifyInstance,
  userId: string,
  recipeId: string
): Promise<Reply.Note | undefined> => {
  const { rows } = await fastify.pg.query<Reply.Note>(
    `
		SELECT
			id, note, user_id as "userId", recipe_id as "recipeId"
		FROM notes
		WHERE user_id = $1
		AND recipe_id = $2;
		`,
    [userId, recipeId]
  );

  return rows[0];
};

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: Params }>(
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
        const note = await GetNotes(
          fastify,
          request.user.userId,
          request.params.recipeId
        );

        if (!note) {
          const errorResponse: FamilyRecipes.Error = {
            message: "You have no notes for this recipe.",
            code: "404",
          };
          return reply.status(404).send(errorResponse);
        }

        return reply.status(200).send(note);
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to get your notes.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
