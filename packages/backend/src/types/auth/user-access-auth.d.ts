import { FastifyPlugin, FastifyReply, FastifyRequest } from "fastify";
interface PluginOptions {}

export interface userAccessAuth {
  (request: FastifyRequest, reply: FastifyReply): void;
}

declare module "fastify" {
  interface FastifyInstance {
    userAccessAuth: userAccessAuth;
  }
}
export const userAccessAuth: FastifyPlugin<PluginOptions>;
export default userAccessAuth;
