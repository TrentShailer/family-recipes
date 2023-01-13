import type { FastifyInstance, FastifySchema } from "fastify";
import { GetImage } from "../../../../../../helpers/image-helper";
import fs from "fs";
import path from "path";

type Params = {
  recipeId: string;
};

const schema: FastifySchema = {
  params: {
    type: "object",
    required: ["recipeId"],
    properties: {
      recipeId: { type: "string" },
    },
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: Params }>(
    "/",
    {
      schema,
      onRequest: [fastify.jwtAuth, fastify.recipeAccessAuth],
    },
    async (request, reply) => {
      try {
        const file = await GetImage(fastify, request.params.recipeId);

        reply.status(200).send(file);
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
