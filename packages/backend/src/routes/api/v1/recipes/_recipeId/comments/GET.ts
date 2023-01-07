import type { FastifyInstance, FastifySchema } from "fastify";

type Params = {
  recipeId: string;
};

type Querystring = {
  page: number;
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
    },
  },
};

const GetComments = async (
  fastify: FastifyInstance,
  recipeId: string,
  page: number
): Promise<Reply.Comment[]> => {
  const { rows } = await fastify.pg.query<Reply.Comment>(
    `SELECT
			id,
			user_id,
			recipe_id,
			comment,
			created_at
		FROM comments
		WHERE recipe_id = $1
		ORDER BY created_at DESC
		LIMIT 10
		OFFSET $2;`,
    [recipeId, (page - 1) * 10]
  );

  return rows;
};

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: Params; Querystring: Querystring }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.recipeAccessAuth] },
    async (request, reply) => {
      try {
        const { recipeId } = request.params;
        const { page } = request.query;

        const comments = await GetComments(fastify, recipeId, page);

        return reply.status(200).send(comments);
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
