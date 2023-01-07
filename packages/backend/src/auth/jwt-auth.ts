import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

const jwtAuth = async function (
  fastify: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<string | undefined> {
  try {
    const token = await request.jwtVerify();
    const userId = token.userId;

    try {
      // ensure user exists
      const { rowCount: userRowCount } = await fastify.pg.query(
        `
					SELECT
						id
					FROM users
					WHERE id = $1;
					`,
        [userId]
      );

      if (userRowCount === 0) {
        const errorResponse: FamilyRecipes.Error = {
          message: "Your account no longer exists.",
          code: "404",
        };
        return reply.clearCookie("token").status(404).send(errorResponse);
      }

      return userId;
    } catch (error) {
      fastify.log.error(error);

      const errorResponse: FamilyRecipes.Error = {
        message: "An error occurred while verifying your account.",
        code: "500",
      };

      return reply.status(500).send(errorResponse);
    }
  } catch (err) {
    reply.clearCookie("token").send(err);
  }
};

const plugin = fp(async function (fastify: FastifyInstance) {
  fastify.decorate(
    "jwtAuth",
    async function (request: FastifyRequest, reply: FastifyReply) {
      await jwtAuth(fastify, request, reply);
    }
  );
});

export default plugin;
export { jwtAuth };
