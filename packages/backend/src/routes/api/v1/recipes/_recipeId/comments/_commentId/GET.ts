import type { FastifyInstance, FastifySchema } from "fastify";

type Params = {
  recipeId: string;
  commentId: string;
};
const schema: FastifySchema = {
  params: {
    type: "object",
    required: ["recipeId"],
    properties: {
      recipeId: { type: "string" },
    },
  },
};

const GetComment = async (
  fastify: FastifyInstance,
  recipeId: string,
  commentId: string
): Promise<Reply.Comment | null> => {
  const { rows } = await fastify.pg.query<Reply.Comment>(
    `
		SELECT
			id,
			user_id,
			recipe_id,
			comment,
			created_at
		FROM comments
		WHERE
			id = $1
			AND recipe_id = $2;`,
    [commentId, recipeId]
  );

  return rows[0] || null;
};

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: Params }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.recipeAccessAuth] },
    async (request, reply) => {
      try {
        const { recipeId, commentId } = request.params;

        const comment = await GetComment(fastify, recipeId, commentId);

        if (!comment) {
          const errorResponse: FamilyRecipes.Error = {
            message: "Comment not found.",
            code: "404",
          };
          return reply.status(404).send(errorResponse);
        }

        reply.status(200).send(comment);
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
