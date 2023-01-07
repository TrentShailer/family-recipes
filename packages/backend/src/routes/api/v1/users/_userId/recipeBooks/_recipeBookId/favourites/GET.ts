import type { FastifyInstance, FastifySchema } from "fastify";

type Params = {
  userId: string;
  recipeBookId: string;
};

const schema: FastifySchema = {
  params: {
    type: "object",
    required: ["userId", "recipeBookId"],
    properties: {
      userId: { type: "string" },
      recipeBookId: { type: "string" },
    },
  },
};

const getFavourites = async (
  fastify: FastifyInstance,
  userId: string,
  recipeBookId: string
): Promise<Reply.Favourite[]> => {
  const { rows } = await fastify.pg.query<Reply.Favourite>(
    `
		SELECT
			id,
			recipe_id AS "recipeId",
			user_id AS "userId"
		FROM recipes
		WHERE recipe_book_id = $1
		AND user_id = $2
		INNER JOIN favourites ON favourites.recipe_id = recipes.id;
		`,
    [recipeBookId, userId]
  );

  return rows;
};

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Params: Params }>(
    "/",
    {
      schema,
      onRequest: [
        fastify.jwtAuth,
        fastify.userAccessAuth,
        fastify.recipeBookAccessAuth,
      ],
    },
    async (request, reply) => {
      try {
        const { userId, recipeBookId } = request.params;

        const favourites = await getFavourites(fastify, userId, recipeBookId);

        return reply.status(200).send(favourites);
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong getting your favourites.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
