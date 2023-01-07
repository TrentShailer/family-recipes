import { FastifyPlugin, FastifyReply, FastifyRequest } from "fastify";
interface PluginOptions {}

export interface recipeBookAccessAuth {
  (request: FastifyRequest, reply: FastifyReply): void;
}

declare module "fastify" {
  interface FastifyInstance {
    recipeBookAccessAuth: recipeBookAccessAuth;
  }
}
export const recipeBookAccessAuth: FastifyPlugin<PluginOptions>;
export default recipeBookAccessAuth;
