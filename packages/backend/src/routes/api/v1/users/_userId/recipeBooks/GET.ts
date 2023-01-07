import type { FastifyInstance, FastifySchema } from "fastify";

type Params = {
  userId: string;
};

const schema: FastifySchema = {
  params: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: { type: "string" },
    },
  },
};

const GetRecipeBooks = async (
  fastify: FastifyInstance,
  userId: string
): Promise<string[]> => {
  const { rows } = await fastify.pg.query<{ recipeBookId: string }>(
    `
		SELECT
			recipe_book_id as "recipeBookId"
		FROM book_editors
		WHERE user_id = $1;
		`,
    [userId]
  );

  const recipeBookIds = rows.map((row) => row.recipeBookId);
  return recipeBookIds;
};

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: Params }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.userAccessAuth] },
    async (request, reply) => {
      try {
        const recipeBookIds = await GetRecipeBooks(
          fastify,
          request.params.userId
        );

        return reply.status(200).send(recipeBookIds);
      } catch (error) {
        fastify.log.error(error);
        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to get your recipe books.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
