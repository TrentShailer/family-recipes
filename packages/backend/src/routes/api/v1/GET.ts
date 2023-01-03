import type { FastifyInstance, FastifySchema } from "fastify";
export default async function (fastify: FastifyInstance) {
  fastify.get("/", async (request, reply) => {
    reply.send("pong");
  });
}
