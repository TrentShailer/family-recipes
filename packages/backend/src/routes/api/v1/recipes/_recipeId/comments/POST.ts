import type { FastifyInstance, FastifySchema } from "fastify";

type Params = {
  recipeId: string;
};

type Body = {
  comment: string;
};

const schema: FastifySchema = {
  params: {
    type: "object",
    required: ["recipeId"],
    properties: {
      recipeId: { type: "string" },
    },
  },
  body: {
    type: "object",
    required: ["comment"],
    properties: {
      comment: { type: "string" },
    },
  },
};

const CreateComment = async (
  fastify: FastifyInstance,
  userId: string,
  recipeId: string,
  comment: string
): Promise<Reply.Comment | null> => {
  const { rows } = await fastify.pg.query<Reply.Comment>(
    `INSERT INTO comments
		(
			user_id,
			recipe_id,
			comment
		)
		VALUES ($1, $2, $3)
		RETURNING
			id,
			user_id,
			recipe_id,
			comment,
			created_at;`,
    [userId, recipeId, comment]
  );

  return rows[0] || null;
};

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Params: Params; Body: Body }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.recipeAccessAuth] },
    async (request, reply) => {
      try {
        const userId = request.user.userId;
        const { recipeId } = request.params;
        const { comment } = request.body;

        const newComment = await CreateComment(
          fastify,
          userId,
          recipeId,
          comment
        );

        if (!newComment) {
          throw new Error(
            "Something went wrong when trying to create the comment."
          );
        }

        reply.status(200).send(newComment);
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to create the comment.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
