import type { FastifyInstance, FastifySchema } from "fastify";

type Params = {
  recipeId: string;
};

type Querystring = {
  page: number;
  items?: number;
};

const schema: FastifySchema = {
  params: {
    type: "object",
    required: ["recipeId"],
    properties: {
      recipeId: { type: "string" },
    },
  },
  querystring: {
    type: "object",
    required: ["page"],
    properties: {
      page: { type: "number" },
      items: { type: "number" },
    },
  },
};

const GetComments = async (
  fastify: FastifyInstance,
  recipeId: string,
  page: number,
  items: number
): Promise<string[]> => {
  const { rows } = await fastify.pg.query<{ id: string }>(
    `SELECT
			id
		FROM comments
		WHERE recipe_id = $1
		ORDER BY created_at DESC
		LIMIT $3
		OFFSET $2;`,
    [recipeId, (page - 1) * items, items]
  );

  return rows.map((row) => row.id);
};

const GetCommentCount = async (
  fastify: FastifyInstance,
  recipeId: string
): Promise<number> => {
  const { rows } = await fastify.pg.query<{ count: number }>(
    `SELECT
			COUNT(id)::int AS count
		FROM comments
		WHERE recipe_id = $1;`,
    [recipeId]
  );

  return rows[0].count;
};

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: Params; Querystring: Querystring }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.recipeAccessAuth] },
    async (request, reply) => {
      try {
        const { recipeId } = request.params;
        const { page } = request.query;

        let { items } = request.query;

        if (!items) items = 10;

        const commentIds = await GetComments(fastify, recipeId, page, items);
        const commentCount = await GetCommentCount(fastify, recipeId);

        return reply.status(200).send({
          commentCount,
          commentIds,
        });
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to get the comments.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
