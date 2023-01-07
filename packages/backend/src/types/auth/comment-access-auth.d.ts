import { FastifyPlugin, FastifyReply, FastifyRequest } from "fastify";
interface PluginOptions {}

export interface commentAccessAuth {
  (request: FastifyRequest, reply: FastifyReply): void;
}

declare module "fastify" {
  interface FastifyInstance {
    commentAccessAuth: commentAccessAuth;
  }
}
export const commentAccessAuth: FastifyPlugin<PluginOptions>;
export default commentAccessAuth;
