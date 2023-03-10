import type { FastifyInstance, FastifySchema } from "fastify";
import { Compress, UpdateImage } from "../../../../../../helpers/image-helper";
import fs from "fs";
import { upload } from "../../../../../..";
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
  fastify.put<{ Params: Params }>(
    "/",
    {
      schema,
      onRequest: [fastify.jwtAuth, fastify.recipeAccessAuth],
      preHandler: upload.single("image"),
    },
    async (request, reply) => {
      try {
        if (!request.file.destination || !request.file.filename) {
          const errorResponse: FamilyRecipes.Error = {
            message: "No file was uploaded.",
            code: "400",
          };
          return reply.status(400).send(errorResponse);
        }

        const file = path.join(request.file.destination, request.file.filename);

        const buffer = fs.readFileSync(file);
        const compressed = await Compress(buffer);
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
