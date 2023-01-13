import type { FastifyInstance, FastifySchema } from "fastify";

const schema: FastifySchema = {};

export default async function (fastify: FastifyInstance) {
  fastify.get(
    "/",
    { schema, onRequest: [fastify.jwtAuth] },
    async (request, reply) => {
      try {
        const name = await fastify.pg.query(
          "SELECT name FROM users WHERE id = $1",
          [request.user.userId]
        );

        if (name.rowCount === 0) {
          const errorResponse: FamilyRecipes.Error = {
            message: "User not found.",
            code: "404",
          };
          return reply.status(404).send(errorResponse);
        }

        return reply.status(200).send({
          userId: request.user.userId,
          name: name.rows[0].name,
        });
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to get your session.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
