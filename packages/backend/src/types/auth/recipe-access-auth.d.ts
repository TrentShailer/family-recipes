import { FastifyPlugin, FastifyReply, FastifyRequest } from "fastify";
interface PluginOptions {}

export interface recipeAccessAuth {
  (request: FastifyRequest, reply: FastifyReply): void;
}

declare module "fastify" {
  interface FastifyInstance {
    recipeAccessAuth: recipeAccessAuth;
  }
}
export const recipeAccessAuth: FastifyPlugin<PluginOptions>;
export default recipeAccessAuth;
