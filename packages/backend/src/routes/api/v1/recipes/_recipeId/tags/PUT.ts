import type { FastifyInstance, FastifySchema } from "fastify";

type Params = {
  recipeId: string;
};

type Body = {
  tags: string[];
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
    required: ["tags"],
    properties: {
      tags: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
  },
};

const SetTags = async (
  fastify: FastifyInstance,
  recipeId: string,
  tags: string[]
): Promise<void> => {
  await fastify.pg.query(
    `
		DELETE FROM tags
		WHERE recipe_id = $1;
		`,
    [recipeId]
  );

  // remove duplicates
  tags = [...new Set(tags)];

  // create a string of values to insert
  // e.g. ($1, $2), ($1, $3), ($1, $4)
  const values = tags.map((tag, index) => `($1, $${index + 2})`).join(", ");

  await fastify.pg.query(
    `
		INSERT INTO tags (recipe_id, tag)
		VALUES ${values};
		`,
    [recipeId, ...tags]
  );
};

export default async function (fastify: FastifyInstance) {
  fastify.put<{ Params: Params; Body: Body }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.recipeAccessAuth] },
    async (request, reply) => {
      try {
        await SetTags(fastify, request.params.recipeId, request.body.tags);

        reply.status(200).send();
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
