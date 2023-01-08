import type { FastifyInstance, FastifySchema } from "fastify";

type Params = {
  recipeId: string;
};

type Body = {
  name: string;
  time: number;
  servings: number;
  ingredients: Database.IngredientCategory[];
  steps: string[];
  author: string;
  notes: string | null | undefined;
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
    required: ["name", "time", "servings", "ingredients", "steps", "author"],
    properties: {
      name: { type: "string" },
      time: { type: "number" },
      servings: { type: "number" },
      ingredients: {
        type: "array",
        items: {
          type: "object",
          required: ["name", "ingredients"],
          properties: {
            name: { type: "string" },
            ingredients: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
        },
      },
      steps: {
        type: "array",
        items: {
          type: "string",
        },
      },
      author: { type: "string" },
      notes: { type: "string" },
    },
  },
};

const UpdateRecipe = async (
  fastify: FastifyInstance,
  recipeId: string,
  recipe: Body
): Promise<Database.Recipe | null> => {
  const { rows } = await fastify.pg.query<Database.Recipe>(
    `
		UPDATE recipes
		SET name = $1, time = $2, servings = $3, ingredients = $4, steps = $5, author = $6, notes = $7
		WHERE id = $8
		RETURNING id, recipe_book_id, name, time, servings, ingredients, steps, author, notes;
		`,
    [
      recipe.name,
      recipe.time,
      recipe.servings,
      recipe.ingredients,
      recipe.steps,
      recipe.author,
      recipe.notes,
      recipeId,
    ]
  );

  return rows[0] || null;
};

export default async function (fastify: FastifyInstance) {
  fastify.put<{ Params: Params; Body: Body }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.recipeAccessAuth] },
    async (request, reply) => {
      try {
        const recipe = await UpdateRecipe(
          fastify,
          request.params.recipeId,
          request.body
        );

        if (recipe === null) {
          throw new Error("Failed to update recipe");
        }

        reply.status(200).send(recipe);
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to update the recipe.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
