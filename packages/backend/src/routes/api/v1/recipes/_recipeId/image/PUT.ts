import type { FastifyInstance, FastifySchema } from "fastify";
import { Compress, UpdateImage } from "../../../../../../helpers/image-helper";

type Params = {
  recipeId: string;
};

type Body = {
  file: UploadedFile;
};

const schema: FastifySchema = {
  params: {
    type: "object",
    required: ["recipeId"],
    properties: {
      recipeId: { type: "string" },
    },
  },
  body: {
    type: "object",
    required: ["file"],
    properties: {
      file: {
        type: "object",
      },
    },
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.put<{ Params: Params; Body: Body }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.recipeAccessAuth] },
    async (request, reply) => {
      try {
        const compressed = await Compress(request.body.file.data);
        await UpdateImage(fastify, request.params.recipeId, compressed);

        reply.status(200).send();
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to update the image.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
