import type { FastifyInstance, FastifySchema } from "fastify";

const schema: FastifySchema = {};

export default async function (fastify: FastifyInstance) {
  fastify.delete("/", { schema }, async (request, reply) => {
    try {
      return reply.clearCookie("token").status(200).send();
    } catch (error) {
      fastify.log.error(error);

      const errorResponse: FamilyRecipes.Error = {
        message: "Something went wrong when trying to log you out.",
        code: "500",
      };
      return reply.status(500).send(errorResponse);
    }
  });
}
