import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { jwtAuth } from "./jwt-auth";

const plugin = fp(async function (fastify: FastifyInstance) {
  fastify.decorate(
    "commentAccessAuth",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        const userId = await jwtAuth(fastify, request, reply);
        if (!userId) {
          return;
        }

        if (
          typeof request.params === "object" &&
          request.params !== null &&
          "commentId" in request.params
        ) {
          const commentId = request.params.commentId;

          // get comment author
          const { rows: commentRows } = await fastify.pg.query<{
            userId: string;
          }>(
            `
						SELECT
							user_id as "userId"
						FROM comments
						WHERE id = $1;
						`,
            [commentId]
          );

          if (commentRows.length === 0) {
            const errorResponse: FamilyRecipes.Error = {
              message: "Comment does not exist.",
              code: "404",
            };
            return reply.status(404).send(errorResponse);
          }

          const commentUserId = commentRows[0].userId;

          if (userId !== commentUserId) {
            const errorResponse: FamilyRecipes.Error = {
              message: "You are not the author of this comment.",
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
