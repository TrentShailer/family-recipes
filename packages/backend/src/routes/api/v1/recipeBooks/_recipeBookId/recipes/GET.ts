import type { FastifyInstance, FastifySchema } from "fastify";

type Params = {
  recipeBookId: string;
};

type QueryString = {
  page: number;
  search?: string;
};

const schema: FastifySchema = {
  params: {
    type: "object",
    required: ["recipeBookId"],
    properties: {
      recipeBookId: { type: "string" },
    },
  },
  querystring: {
    type: "object",
    required: ["page"],
    properties: {
      page: { type: "number" },
      search: { type: "string" },
    },
  },
};

const GetRecipes = async (
  fastify: FastifyInstance,
  recipeBookId: string,
  page: number,
  search?: string
): Promise<string[]> => {
  const { rows } = await fastify.pg.query<{ id: string }>(
    `
		SELECT
			recipes.id,
		FROM recipes
		WHERE recipes.recipe_book_id = $1
		AND (
			recipes.name ILIKE $2
			OR recipes.steps ILIKE $2
			OR recipes.notes ILIKE $2
			OR recipe.authors ILIKE $2
			OR EXISTS (
				SELECT id
				FROM recipe_tags
				WHERE recipe_tags.recipe_id = recipes.id
				AND recipe_tags.tag ILIKE $2
			)
		)
		ORDER BY recipes.name
		LIMIT 10
		OFFSET $3;
		`,
    [recipeBookId, `%${search}%`, (page - 1) * 10]
  );

  return rows.map((row) => row.id);
};

const GetRecipeCount = async (
  fastify: FastifyInstance,
  recipeBookId: string,
  search?: string
): Promise<number> => {
  const { rows } = await fastify.pg.query<{ count: number }>(
    `
		SELECT
			COUNT(*)
		FROM recipes
		WHERE recipes.recipe_book_id = $1
		AND (
			recipes.name ILIKE $2
			OR recipes.steps ILIKE $2
			OR recipes.notes ILIKE $2
			OR recipes.author ILIKE $2
			OR EXISTS (
				SELECT id
				FROM recipe_tags
				WHERE recipe_tags.recipe_id = recipes.id
				AND recipe_tags.tag ILIKE $2
			)
		);
		`,
    [recipeBookId, `%${search}%`]
  );

  return rows[0].count;
};

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: Params; Querystring: QueryString }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.recipeBookAccessAuth] },
    async (request, reply) => {
      try {
        const { recipeBookId } = request.params;
        const { page, search } = request.query;

        const recipeCount = await GetRecipeCount(fastify, recipeBookId, search);
        const recipeIds = await GetRecipes(fastify, recipeBookId, page, search);

        reply.status(200).send({
          recipeCount,
          recipeIds,
        });
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
