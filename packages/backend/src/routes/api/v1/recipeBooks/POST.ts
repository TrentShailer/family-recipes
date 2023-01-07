import type { FastifyInstance, FastifySchema } from "fastify";
import * as argon2 from "argon2";
type Body = {
  name: string;
  password: string;
};

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

const RecipeBookExists = async (
  fastify: FastifyInstance,
  name: string
): Promise<boolean> => {
  const { rowCount } = await fastify.pg.query(
    `
		SELECT
			id
		FROM recipe_books
		WHERE name = $1;
		`,
    [name]
  );

  return rowCount !== 0;
};

const CreateRecipeBook = async (
  fastify: FastifyInstance,
  name: string,
  password: string
): Promise<Reply.RecipeBook> => {
  const hashedPassword = await argon2.hash(password);

  const { rows } = await fastify.pg.query<Reply.RecipeBook>(
    `
			INSERT INTO recipe_books (name, password)
			VALUES ($1, $2)
			RETURNING id, name;
			`,
    [name, hashedPassword]
  );

  return rows[0];
};

const MakeUserEditor = async (
  fastify: FastifyInstance,
  recipeBookId: string,
  userId: string
): Promise<void> => {
  await fastify.pg.query(
    `
			INSERT INTO book_editors (recipe_book_id, user_id)
			VALUES ($1, $2);
			`,
    [recipeBookId, userId]
  );
};

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Body }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth] },
    async (request, reply) => {
      try {
        const { name, password } = request.body;

        if (await RecipeBookExists(fastify, name)) {
          const errorResponse: FamilyRecipes.Error = {
            message: "A recipe book with that name already exists.",
            code: "409",
          };
          return reply.status(409).send(errorResponse);
        }

        const recipeBook = await CreateRecipeBook(fastify, name, password);

        await MakeUserEditor(fastify, recipeBook.id, request.user.userId);

        return reply.status(201).send(recipeBook);
      } catch (error) {
        fastify.log.error(error);
        const errorResponse: FamilyRecipes.Error = {
          message:
            "Something went wrong when trying to create the recipe book.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
