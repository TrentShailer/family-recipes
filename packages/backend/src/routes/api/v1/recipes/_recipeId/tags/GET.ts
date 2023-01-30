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

const GetTags = async (
  fastify: FastifyInstance,
  recipeId: string
): Promise<string[]> => {
  const { rows } = await fastify.pg.query<{ tag: string }>(
    `
		SELECT tag
		FROM tags
		WHERE recipe_id = $1;
		`,
    [recipeId]
  );

  return rows.map((row) => row.tag) || [];
};

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: Params }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.recipeAccessAuth] },
    async (request, reply) => {
      try {
        const tags = await GetTags(fastify, request.params.recipeId);

        reply.status(200).send(tags);
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message:
            "Something went wrong when trying to get the tags for a recipe.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
