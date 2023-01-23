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

const NameAlreadyExists = async (
  fastify: FastifyInstance,
  name: string
): Promise<boolean> => {
  const { rowCount } = await fastify.pg.query(
    `
		SELECT
			id
		FROM users
		WHERE name = $1;
		`,
    [name]
  );

  if (rowCount !== 0) {
    return true;
  }

  return false;
};

const CreateUser = async (
  fastify: FastifyInstance,
  name: string,
  password: string
): Promise<Reply.User> => {
  const hashedPassword = await argon2.hash(password);

  const { rows } = await fastify.pg.query<Reply.User>(
    `
		INSERT INTO users (name, password)
		VALUES ($1, $2)
		RETURNING id, name;
		`,
    [name, hashedPassword]
  );

  return rows[0];
};

const SetJWT = async (reply: FastifyReply, user: Reply.User) => {
  const token = await reply.jwtSign({ userId: user.id });

  reply.setCookie("token", token, {
    domain: process.env.DOMAIN ?? "localhost",
    path: "/",
    secure: process.env.INSECURE ? false : true,
    httpOnly: true,
    sameSite: "strict",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
  });
};

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Body }>("/", { schema }, async (request, reply) => {
    try {
      const { name, password } = request.body;

      const nameExists = await NameAlreadyExists(fastify, name);
      if (nameExists) {
        const errorResponse: FamilyRecipes.Error = {
          message: "A user with that name already exists.",
          code: "409",
        };
        return reply.status(409).send(errorResponse);
      }

      const user = await CreateUser(fastify, name, password);

      await SetJWT(reply, user);

      return reply.status(201).send(user);
    } catch (error) {
      fastify.log.error(error);

      const errorResponse: FamilyRecipes.Error = {
        message: "Something went wrong when trying to create your account.",
        code: "500",
      };
      return reply.status(500).send(errorResponse);
    }
  });
}
