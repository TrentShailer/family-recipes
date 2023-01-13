import type { FastifyInstance, FastifySchema } from "fastify";

type Params = {
  recipeId: string;
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

const GetRecipe = async (
  fastify: FastifyInstance,
  recipeId: string
): Promise<Reply.Recipe | null> => {
  const { rows } = await fastify.pg.query<Reply.Recipe>(
    `
		SELECT id, recipe_book_id as recipeBookId, name, time, servings, ingredients, steps, author, notes, has_Image as hasImage
		FROM recipes
		WHERE id = $1;
		`,
    [recipeId]
  );

  return rows[0] || null;
};

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: Params }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.recipeAccessAuth] },
    async (request, reply) => {
      try {
        const recipe = await GetRecipe(fastify, request.params.recipeId);

        if (!recipe) {
          const errorResponse: FamilyRecipes.Error = {
            message: "Recipe not found.",
            code: "404",
          };
          return reply.status(404).send(errorResponse);
        }

        reply.status(200).send(recipe);
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to get the recipe.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
