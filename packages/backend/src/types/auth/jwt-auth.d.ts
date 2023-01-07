import { FastifyPlugin, FastifyReply, FastifyRequest } from "fastify";
interface PluginOptions {}

export interface jwtAuth {
  (request: FastifyRequest, reply: FastifyReply): void;
}

declare module "fastify" {
  interface FastifyInstance {
    jwtAuth: jwtAuth;
  }
}
export const jwtAuth: FastifyPlugin<PluginOptions>;
export default jwtAuth;
