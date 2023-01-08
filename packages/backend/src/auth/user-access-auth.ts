import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { jwtAuth } from "./jwt-auth";

const plugin = fp(async function (fastify: FastifyInstance) {
  fastify.decorate(
    "userAccessAuth",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        const userId = await jwtAuth(fastify, request, reply);
        if (!userId) {
          return;
        }

        if (
          typeof request.params === "object" &&
          request.params !== null &&
          "userId" in request.params
        ) {
          if (request.params.userId !== userId) {
            const errorResponse: FamilyRecipes.Error = {
              message: "You are not authorized to access this user.",
              code: "403",
            };
            return reply.status(403).send(errorResponse);
          }
        } else {
          throw new Error("Invalid request parameters.");
        }
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "An error occurred while authenticating.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
});

export default plugin;
