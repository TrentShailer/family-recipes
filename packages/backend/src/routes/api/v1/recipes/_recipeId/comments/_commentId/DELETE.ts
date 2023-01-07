import type { FastifyInstance, FastifySchema } from "fastify";

type Params = {
  recipeId: string;
  commentId: string;
};

const schema: FastifySchema = {
  params: {
    type: "object",
    required: ["recipeId", "commentId"],
    properties: {
      recipeId: { type: "string" },
      commentId: { type: "string" },
    },
  },
};

const DeleteComment = async (
  fastify: FastifyInstance,
  recipeId: string,
  commentId: string
): Promise<void> => {
  await fastify.pg.query(
    `DELETE FROM comments WHERE id = $1 AND recipe_id = $2;`,
    [commentId, recipeId]
  );
};

export default async function (fastify: FastifyInstance) {
  fastify.delete<{ Params: Params }>(
    "/",
    {
      schema,
      onRequest: [
        fastify.jwtAuth,
        fastify.recipeAccessAuth,
        fastify.commentAccessAuth,
      ],
    },
    async (request, reply) => {
      try {
        const { recipeId, commentId } = request.params;

        await DeleteComment(fastify, recipeId, commentId);

        return reply.status(200).send();
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to delete the comment.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
