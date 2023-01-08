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

const CreateNote = async (
  fastify: FastifyInstance,
  userId: string,
  recipeId: string,
  note: string
): Promise<Reply.Note | null> => {
  const { rows } = await fastify.pg.query<Reply.Note>(
    `
		INSERT INTO notes (user_id, recipe_id, note)
		VALUES ($1, $2, $3)
		RETURNING id, note, user_id as userId, recipe_id as recipeId;
		`,
    [userId, recipeId, note]
  );

  return rows[0] || null;
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
        const newNote = await CreateNote(
          fastify,
          request.user.userId,
          request.params.recipeId,
          request.body.note
        );

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
