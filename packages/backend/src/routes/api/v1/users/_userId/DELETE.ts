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

export default async function (fastify: FastifyInstance) {
  fastify.delete<{ Params: Params }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.userAccessAuth] },
    async (request, reply) => {
      try {
        await fastify.pg.query(
          `
					DELETE FROM users
					WHERE id = $1;
					`,
          [request.user.userId]
        );

        return reply.clearCookie("token").status(200).send();
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to delete your account.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
