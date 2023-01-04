import { FastifyPlugin, FastifyReply, FastifyRequest } from "fastify";
interface PluginOptions {}

export interface authenticate {
  (request: FastifyRequest, reply: FastifyReply): void;
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: authenticate;
  }
}
export const jwtAuth: FastifyPlugin<PluginOptions>;
export default jwtAuth;
