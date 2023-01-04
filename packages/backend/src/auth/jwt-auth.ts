import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

const plugin = fp(async function (fastify: FastifyInstance) {
  // fastify.register(fastifyJwt, {
  //   secret: {
  //     private: process.env.PRIVATE_KEY,
  //     public: process.env.PUBLIC_KEY,
  //   },
  //   sign: {
  //     algorithm: process.env.KEY_ALGORITHM,
  //     expiresIn: "14d",
  //   },
  //   cookie: {
  //     cookieName: "token",
  //     signed: false,
  //   },
  // });

  fastify.decorate(
    "authenticate",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  );
});

export default plugin;
