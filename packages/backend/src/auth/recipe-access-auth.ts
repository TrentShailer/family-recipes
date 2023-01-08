import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { jwtAuth } from "./jwt-auth";

const plugin = fp(async function (fastify: FastifyInstance) {
  fastify.decorate(
    "recipeAccessAuth",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        const userId = await jwtAuth(fastify, request, reply);
        if (!userId) {
          return;
        }

        if (
          typeof request.params === "object" &&
          request.params !== null &&
          "recipeId" in request.params
        ) {
          const recipeId = request.params.recipeId;

          // get recipe book id
          const { rows: recipeBookRows } = await fastify.pg.query<{
            recipeBookId: string;
          }>(
            `
						SELECT
							recipe_book_id as "recipeBookId"
						FROM recipes
						WHERE id = $1;
						`,
            [recipeId]
          );

          if (recipeBookRows.length === 0) {
            const errorResponse: FamilyRecipes.Error = {
              message: "Recipe does not exist.",
              code: "404",
            };
            return reply.status(404).send(errorResponse);
          }

          const recipeBookId = recipeBookRows[0].recipeBookId;

          // ensure user is an editor of the recipe book
          const { rowCount: recipeBookRowCount } = await fastify.pg.query(
            `
						SELECT
							id
						FROM book_editors
						WHERE recipe_book_id = $1
						AND user_id = $2;
						`,
            [recipeBookId, userId]
          );

          if (recipeBookRowCount === 0) {
            const errorResponse: FamilyRecipes.Error = {
              message: "You are not an editor of this recipe book.",
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
