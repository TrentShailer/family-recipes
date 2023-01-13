import type { FastifyInstance, FastifySchema } from "fastify";
import fs from "fs";
import path from "path";

type Params = {
  recipeBookId: string;
};

const schema: FastifySchema = {
  params: {
    type: "object",
    required: ["recipeBookId"],
    properties: {
      recipeBookId: { type: "string" },
    },
  },
};

const GetImage = async (
  fastify: FastifyInstance,
  recipeBookId: string
): Promise<string | null> => {
  const { rows } = await fastify.pg.query(
    `
		SELECT id FROM recipes where recipe_book_id = $1 AND has_image = TRUE;
		`,
    [recipeBookId]
  );

  if (rows.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * rows.length);
  return rows[index].id;
};

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: Params }>(
    "/",
    {
      schema,
      onRequest: [fastify.jwtAuth, fastify.recipeBookAccessAuth],
    },
    async (request, reply) => {
      try {
        const recipeId = await GetImage(fastify, request.params.recipeBookId);
        reply.status(200).send(recipeId);
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to get the image.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
