import type { FastifyInstance, FastifySchema } from "fastify";
import * as argon2 from "argon2";

type Params = {
  userId: string;
};

type Body = {
  name: string;
  password: string;
};

const schema: FastifySchema = {
  params: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: { type: "string" },
    },
  },
  body: {
    type: "object",
    required: ["name", "password"],
    properties: {
      name: { type: "string" },
      password: { type: "string" },
    },
  },
};

const GetRecipeBook = async (
  fastify: FastifyInstance,
  name: string
): Promise<Database.RecipeBook | null> => {
  const { rows } = await fastify.pg.query<Database.RecipeBook>(
    `
		SELECT
			id, name, password
		FROM recipe_books
		WHERE name = $1;
		`,
    [name]
  );

  return rows[0] || null;
};

// check if user is already an editor of the recipe book
const IsUserEditor = async (
  fastify: FastifyInstance,
  recipeBookId: string,
  userId: string
): Promise<boolean> => {
  const { rowCount } = await fastify.pg.query(
    `
		SELECT id
		FROM book_editors
		WHERE recipe_book_id = $1
		AND user_id = $2;
		`,
    [recipeBookId, userId]
  );

  return rowCount > 0;
};

// check if password matches the recipe book password
const IsCorrectPassword = async (
  fastify: FastifyInstance,
  hashedPassword: string,
  password: string
): Promise<boolean> => {
  return await argon2.verify(hashedPassword, password);
};

// add user as an editor of the recipe book
const AddUserAsEditor = async (
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
  fastify.post<{ Params: Params; Body: Body }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth, fastify.userAccessAuth] },
    async (request, reply) => {
      try {
        const recipeBook = await GetRecipeBook(fastify, request.body.name);

        if (!recipeBook) {
          const errorResponse: FamilyRecipes.Error = {
            message: "Recipe book name or password are incorrect.",
            code: "401",
          };
          return reply.status(401).send(errorResponse);
        }

        const isUserEditor = await IsUserEditor(
          fastify,
          recipeBook.id,
          request.user.userId
        );

        if (isUserEditor) {
          const errorResponse: FamilyRecipes.Error = {
            message: "You are already an editor of this recipe book.",
            code: "409",
          };
          return reply.status(409).send(errorResponse);
        }

        const correctPassword = await IsCorrectPassword(
          fastify,
          recipeBook.password,
          request.body.password
        );

        if (!correctPassword) {
          const errorResponse: FamilyRecipes.Error = {
            message: "Recipe book name or password are incorrect.",
            code: "401",
          };
          return reply.status(401).send(errorResponse);
        }

        await AddUserAsEditor(fastify, recipeBook.id, request.user.userId);

        return reply.status(201).send({
          id: recipeBook.id,
          name: recipeBook.name,
        });
      } catch (error) {
        fastify.log.error(error);
        const errorResponse: FamilyRecipes.Error = {
          message:
            "Something went wrong when trying to add you to the recipe book.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
