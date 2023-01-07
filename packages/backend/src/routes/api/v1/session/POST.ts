import type { FastifyInstance, FastifyReply, FastifySchema } from "fastify";
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

const GetUser = async (
  fastify: FastifyInstance,
  name: string
): Promise<Database.User | null> => {
  const { rows } = await fastify.pg.query<Database.User>(
    `
			SELECT
				id, name, password
			FROM users
			WHERE name = $1;
			`,
    [name]
  );

  return rows[0] || null;
};

const SetJWT = async (reply: FastifyReply, user: Reply.User) => {
  const token = await reply.jwtSign({ userId: user.id });

  reply.setCookie("token", token, {
    domain: process.env.DOMAIN ?? "localhost",
    path: "/",
    secure: process.env.INSECURE ? false : true,
    httpOnly: true,
    sameSite: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
  });
};

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Body }>("/", { schema }, async (request, reply) => {
    try {
      const { name, password } = request.body;

      const user = await GetUser(fastify, name);

      if (!user) {
        const errorResponse: FamilyRecipes.Error = {
          message: "Username or password incorrect.",
          code: "401",
        };
        return reply.status(401).send(errorResponse);
      }

      const hashedPassword = user.password;
      const correctPassword = await argon2.verify(hashedPassword, password);

      if (!correctPassword) {
        const errorResponse: FamilyRecipes.Error = {
          message: "Username or password incorrect.",
          code: "401",
        };
        return reply.status(401).send(errorResponse);
      }

      await SetJWT(reply, user);

      return reply.status(201).send();
    } catch (error) {
      fastify.log.error(error);

      const errorResponse: FamilyRecipes.Error = {
        message: "Something went wrong when trying to log you in.",
        code: "500",
      };
      return reply.status(500).send(errorResponse);
    }
  });
}
