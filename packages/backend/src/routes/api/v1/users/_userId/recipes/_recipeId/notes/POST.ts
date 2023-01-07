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

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Params: Params; Body: Body }>(
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

        if (hasNotes) {
          const errorResponse: FamilyRecipes.Error = {
            message: "You already have notes for this recipe.",
            code: "409",
          };
          return reply.status(409).send(errorResponse);
        }

        // ensure that the recipe exists
        const { rows: recipeRows } = await fastify.pg.query<{ id: string }>(
          `
					SELECT
						id
					FROM recipes
					WHERE id = $1;
					`,
          [request.params.recipeId]
        );

        if (recipeRows.length === 0) {
          const errorResponse: FamilyRecipes.Error = {
            message:
              "The recipe you are trying to add notes to does not exist.",
            code: "404",
          };
          return reply.status(404).send(errorResponse);
        }

        const { rows: newNoteRows } = await fastify.pg.query<{
          id: string;
          note: string;
        }>(
          `
					INSERT INTO notes (user_id, recipe_id, note)
					VALUES ($1, $2, $3)
					RETURNING id, note;
					`,
          [request.user.userId, request.params.recipeId, request.body.note]
        );

        const newNote = newNoteRows[0];

        return reply.status(201).send(newNote);
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to create your notes.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
