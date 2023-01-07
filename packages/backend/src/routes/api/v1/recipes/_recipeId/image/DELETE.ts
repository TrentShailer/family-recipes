import type { FastifyInstance, FastifySchema } from "fastify";
import { DeleteImage } from "../../../../../../helpers/image-helper";

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
  fastify.delete<{ Params: Params }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.recipeAccessAuth] },
    async (request, reply) => {
      try {
        await DeleteImage(fastify, request.params.recipeId);

        reply.status(200).send();
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to delete the image.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
