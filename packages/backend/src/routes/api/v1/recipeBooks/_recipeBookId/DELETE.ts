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

const DeleteRecipeBook = async (
  fastify: FastifyInstance,
  recipeBookId: string
): Promise<void> => {
  await fastify.pg.query(
    `
		DELETE FROM recipe_books
		WHERE id = $1;
		`,
    [recipeBookId]
  );
};

export default async function (fastify: FastifyInstance) {
  fastify.delete<{ Params: Params }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.recipeBookAccessAuth] },
    async (request, reply) => {
      try {
        await DeleteRecipeBook(fastify, request.params.recipeBookId);

        return reply.status(200).send();
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message:
            "Something went wrong when trying to delete the recipe book.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
