import type { FastifyInstance, FastifySchema } from "fastify";
import * as argon2 from "argon2";
interface Body {
  name: string;
  password: string;
}

const schema: FastifySchema = {
  body: {
    type: "object",
    required: ["name", "password"],
    properties: {
      name: { type: "string" },
      password: { type: "string" },
    },
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Body }>("/", { schema }, async (request, reply) => {
    try {
      const { name, password } = request.body;
      const { rows, rowCount } = await fastify.pg.query<Database.User>(
        `
			SELECT
				id, name, password
			FROM users
			WHERE name == $1;
			`,
        [name]
      );

      if (rowCount === 0 || rows[0] === undefined) {
        const errorResponse: FamilyRecipes.Error = {
          message: "Username or password incorrect.",
          code: "401",
        };
        return reply.status(401).send(errorResponse);
      }

      const hashedPassword = rows[0].password;
      const correctPassword = await argon2.verify(hashedPassword, password);
      if (!correctPassword) {
        const errorResponse: FamilyRecipes.Error = {
          message: "Username or password incorrect.",
          code: "401",
        };
        return reply.status(401).send(errorResponse);
      }
      const payload: FamilyRecipes.JWTPayload = {
        user: {
          id: rows[0].id,
        },
      };

      const token = await reply.jwtSign(payload);

      return reply
        .setCookie("token", token, {
          domain: process.env.DOMAIN ?? "localhost",
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: true,
        })
        .status(200)
        .send();
    } catch (error) {
      console.error(error);

      const errorResponse: FamilyRecipes.Error = {
        message:
          "Something went wrong when trying to log you in, please try again.",
        code: "500",
      };
      return reply.status(500).send(errorResponse);
    }
  });
}
