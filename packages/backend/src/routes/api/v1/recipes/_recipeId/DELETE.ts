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

const DeleteRecipe = async (
  fastify: FastifyInstance,
  recipeId: string
): Promise<void> => {
  await fastify.pg.query(
    `
		DELETE FROM recipes
		WHERE id = $1
		`,
    [recipeId]
  );
};

export default async function (fastify: FastifyInstance) {
  fastify.delete<{ Params: Params }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.recipeAccessAuth] },
    async (request, reply) => {
      try {
        await DeleteRecipe(fastify, request.params.recipeId);

        reply.status(200).send();
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to delete the recipe.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
