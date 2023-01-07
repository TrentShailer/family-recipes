import type { FastifyInstance, FastifySchema } from "fastify";
import * as argon2 from "argon2";

type Params = {
  recipeBookId: string;
};

const schema: FastifySchema = {
  params: {
    type: "object",
    required: ["recipeBookId"],
    properties: {
      recipeBookId: { type: "string" },
    },
  },
};

const GetRecipeBook = async (
  fastify: FastifyInstance,
  recipeBookId: string
): Promise<Reply.RecipeBook | null> => {
  const { rows } = await fastify.pg.query<Reply.RecipeBook>(
    `
		SELECT
			id, name
		FROM recipe_books
		WHERE id = $1;
		`,
    [recipeBookId]
  );

  return rows[0] || null;
};

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: Params }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.recipeBookAccessAuth] },
    async (request, reply) => {
      try {
        const recipeBook = await GetRecipeBook(
          fastify,
          request.params.recipeBookId
        );

        return reply.status(200).send(recipeBook);
      } catch (error) {
        fastify.log.error(error);
        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to get the recipe book.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
