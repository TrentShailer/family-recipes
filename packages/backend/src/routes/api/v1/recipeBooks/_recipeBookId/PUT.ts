import type { FastifyInstance, FastifySchema } from "fastify";
import * as argon2 from "argon2";

type Params = {
  recipeBookId: string;
};

type Body = {
  name: string;
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
    required: ["name"],
    properties: {
      name: { type: "string" },
    },
  },
};

const RecipeBookExists = async (
  fastify: FastifyInstance,
  name: string
): Promise<boolean> => {
  const { rowCount } = await fastify.pg.query(
    `
		SELECT
			id
		FROM recipe_books
		WHERE name = $1;
		`,
    [name]
  );

  return rowCount !== 0;
};

const UpdateRecipeBook = async (
  fastify: FastifyInstance,
  name: string,
  recipeBookId: string
): Promise<Reply.RecipeBook> => {
  const { rows } = await fastify.pg.query<Reply.RecipeBook>(
    `
		UPDATE recipe_books
		SET name = $1
		WHERE id = $2
		RETURNING id, name;
		`,
    [name, recipeBookId]
  );

  return rows[0];
};

export default async function (fastify: FastifyInstance) {
  fastify.put<{ Params: Params; Body: Body }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.recipeBookAccessAuth] },
    async (request, reply) => {
      try {
        if (await RecipeBookExists(fastify, request.body.name)) {
          const errorResponse: FamilyRecipes.Error = {
            message: "A recipe book with that name already exists.",
            code: "409",
          };
          return reply.status(409).send(errorResponse);
        }

        const newRecipeBook = await UpdateRecipeBook(
          fastify,
          request.body.name,
          request.params.recipeBookId
        );

        return reply.status(200).send(newRecipeBook);
      } catch (error) {
        fastify.log.error(error);
        const errorResponse: FamilyRecipes.Error = {
          message:
            "Something went wrong when trying to update the recipe book.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
