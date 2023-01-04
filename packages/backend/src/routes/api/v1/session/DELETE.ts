import type { FastifyInstance, FastifySchema } from "fastify";

const schema: FastifySchema = {};

export default async function (fastify: FastifyInstance) {
  fastify.delete(
    "/",
    { schema, onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        return reply.clearCookie("token").status(200).send();
      } catch (error) {
        console.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message:
            "Something went wrong when trying to log you out, please try again.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
