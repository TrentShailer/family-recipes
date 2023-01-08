import type { FastifyInstance, FastifySchema } from "fastify";

type Params = {
  recipeBookId: string;
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
    required: ["recipeBookId"],
    properties: {
      recipeBookId: { type: "string" },
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

const CreateRecipe = async (
  fastify: FastifyInstance,
  recipeBookId: string,
  recipe: Body
): Promise<Database.Recipe | null> => {
  const { rows } = await fastify.pg.query<Database.Recipe>(
    `
		INSERT INTO recipes (recipe_book_id, name, time, servings, ingredients, steps, author, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, recipe_book_id, name, time, servings, ingredients, steps, author, notes;
		`,
    [
      recipeBookId,
      recipe.name,
      recipe.time,
      recipe.servings,
      recipe.ingredients,
      recipe.steps,
      recipe.author,
      recipe.notes,
    ]
  );

  return rows[0] || null;
};

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Params: Params; Body: Body }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.recipeBookAccessAuth] },
    async (request, reply) => {
      try {
        const recipe = await CreateRecipe(
          fastify,
          request.params.recipeBookId,
          request.body
        );

        if (recipe === null) {
          throw new Error("Failed to create recipe");
        }

        reply.status(201).send(recipe);
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to create the recipe.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
