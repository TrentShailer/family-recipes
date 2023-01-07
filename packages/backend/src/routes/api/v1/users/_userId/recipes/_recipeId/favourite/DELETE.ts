import type { FastifyInstance, FastifySchema } from "fastify";

type Params = {
  userId: string;
  recipeId: string;
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
};

const RecipeInFavourites = async (
  fastify: FastifyInstance,
  userId: string,
  recipeId: string
): Promise<boolean> => {
  const { rowCount } = await fastify.pg.query(
    `
		SELECT id
		FROM favourites
		WHERE user_id = $1
		AND recipe_id = $2;
		`,
    [userId, recipeId]
  );

  return rowCount > 0;
};

const RemoveRecipeFromFavourites = async (
  fastify: FastifyInstance,
  userId: string,
  recipeId: string
): Promise<void> => {
  await fastify.pg.query(
    `
		DELETE FROM favourites
		WHERE user_id = $1
		AND recipe_id = $2;
		`,
    [userId, recipeId]
  );
};

export default async function (fastify: FastifyInstance) {
  fastify.delete<{ Params: Params }>(
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
        const isFavourite = await RecipeInFavourites(
          fastify,
          request.user.userId,
          request.params.recipeId
        );

        if (!isFavourite) {
          const errorResponse: FamilyRecipes.Error = {
            message: "Recipe is not a favourite.",
            code: "404",
          };
          return reply.status(404).send(errorResponse);
        }

        await RemoveRecipeFromFavourites(
          fastify,
          request.user.userId,
          request.params.recipeId
        );

        return reply.status(200).send();
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message:
            "Something went wrong removing the recipe from your favourites.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
