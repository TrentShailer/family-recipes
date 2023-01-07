import type { FastifyInstance, FastifySchema } from "fastify";

type Params = {
  userId: string;
};

const schema: FastifySchema = {
  params: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: { type: "string" },
    },
  },
};

const GetUser = async (
  fastify: FastifyInstance,
  userId: string
): Promise<Reply.User> => {
  const { rows } = await fastify.pg.query<Reply.User>(
    `
		SELECT
			id, name
		FROM users
		WHERE id = $1;
		`,
    [userId]
  );

  return rows[0];
};

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: Params }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth] },
    async (request, reply) => {
      try {
        const user = await GetUser(fastify, request.params.userId);

        if (!user) {
          const errorResponse: FamilyRecipes.Error = {
            message: "This user does not exist.",
            code: "404",
          };
          return reply.status(404).send(errorResponse);
        }

        return reply.status(200).send(user);
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to get your user details.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
