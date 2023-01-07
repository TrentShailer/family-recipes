import type { FastifyInstance, FastifySchema } from "fastify";

type Params = {
  userId: string;
  recipeId: string;
};

type Body = {
  note: string;
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
  body: {
    type: "object",
    required: ["note"],
    properties: {
      note: { type: "string" },
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

const UpdateNotes = async (
  fastify: FastifyInstance,
  userId: string,
  recipeId: string,
  note: string
): Promise<{ id: string; note: string }> => {
  const { rows } = await fastify.pg.query<{ id: string; note: string }>(
    `
		UPDATE notes
		SET note = $1
		WHERE user_id = $2
		AND recipe_id = $3
		RETURNING id, note, user_id as "userId", recipe_id as "recipeId";
		`,
    [note, userId, recipeId]
  );

  return rows[0];
};

export default async function (fastify: FastifyInstance) {
  fastify.put<{ Params: Params; Body: Body }>(
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

        const updatedNote = await UpdateNotes(
          fastify,
          request.user.userId,
          request.params.recipeId,
          request.body.note
        );

        return reply.status(200).send(updatedNote);
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to update your notes.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
