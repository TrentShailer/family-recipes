import type { FastifyInstance, FastifySchema } from "fastify";

type Params = {
  recipeId: string;
  commentId: string;
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

const UpdateComment = async (
  fastify: FastifyInstance,
  userId: string,
  recipeId: string,
  commentId: string,
  comment: string
): Promise<Reply.Comment | null> => {
  const { rows } = await fastify.pg.query<Reply.Comment>(
    `UPDATE comments
		SET
			comment = $1
		WHERE
			id = $2
			AND user_id = $3
			AND recipe_id = $4
		RETURNING
			id,
			user_id,
			recipe_id,
			comment,
			created_at,`,
    [comment, commentId, userId, recipeId]
  );

  return rows[0] || null;
};

export default async function (fastify: FastifyInstance) {
  fastify.put<{ Params: Params; Body: Body }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.recipeAccessAuth] },
    async (request, reply) => {
      try {
        const userId = request.user.userId;
        const { recipeId, commentId } = request.params;
        const { comment } = request.body;

        const newComment = await UpdateComment(
          fastify,
          userId,
          recipeId,
          commentId,
          comment
        );

        if (!newComment) {
          throw new Error(
            "Something went wrong when trying to update the comment."
          );
        }

        reply.status(200).send(newComment);
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to update the comment.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
