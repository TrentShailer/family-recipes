import type { FastifyInstance, FastifySchema } from "fastify";

type Params = {
  page: string;
};

enum AuthType {
  none,
  bookAccess,
  recipeAccess,
  both,
}

type Page = {
  paths: RegExp[];
  auth: AuthType;
  order?: Array<AuthType.bookAccess | AuthType.recipeAccess>;
};

const pages: Page[] = [
  {
    paths: [/^\/authenticate$/],
    auth: AuthType.none,
  },
  {
    paths: [/^\/books$/],
    auth: AuthType.none,
  },
  {
    paths: [/^\/books\/([^\/]+)$/],
    auth: AuthType.bookAccess,
  },
  {
    paths: [/^\/recipe\/([^\/]+)$/],
    auth: AuthType.recipeAccess,
  },
  {
    paths: [/^\/edit\/books\/([^\/]+)\/recipe\/([^\/]+)$/],
    auth: AuthType.both,
    order: [AuthType.bookAccess, AuthType.recipeAccess],
  },
];

const schema: FastifySchema = {
  params: {
    type: "object",
    properties: {
      page: { type: "string" },
    },
  },
};

const BookAccess = async (
  fastify: FastifyInstance,
  bookId: string,
  userId: string
): Promise<boolean> => {
  const { rowCount } = await fastify.pg.query(
    `
			SELECT
				id
			FROM book_editors
			WHERE recipe_book_id = $1
			AND user_id = $2;
		`,
    [bookId, userId]
  );

  return rowCount > 0;
};

const RecipeAccess = async (
  fastify: FastifyInstance,
  recipeId: string,
  userId: string,
  bookId?: string
): Promise<boolean> => {
  // get recipe book id
  const { rows: recipeBookRows } = await fastify.pg.query<{
    recipeBookId: string;
  }>(
    `
			SELECT
				recipe_book_id as "recipeBookId"
			FROM recipes
			WHERE id = $1;
		`,
    [recipeId]
  );

  const recipeBookId = recipeBookRows[0].recipeBookId;

  if (bookId && recipeBookId !== bookId) {
    return false;
  }

  const { rowCount: recipeBookRowCount } = await fastify.pg.query(
    `
			SELECT
				id
			FROM book_editors
			WHERE recipe_book_id = $1
			AND user_id = $2;
		`,
    [recipeBookId, userId]
  );

  return recipeBookRowCount > 0;
};

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: Params }>(
    "/",
    { schema, onRequest: [fastify.jwtAuth] },
    async (request, reply) => {
      try {
        const page = pages.find((page) =>
          page.paths.some((path) => path.test(request.params.page))
        );

        if (!page) {
          const errorResponse: FamilyRecipes.Error = {
            message: "Page not found.",
            code: "404",
          };
          return reply.status(404).send(errorResponse);
        }

        if (page.auth === AuthType.none) {
          return reply.status(200).send();
        }

        const userId = request.user.userId;

        const regex = page.paths[0];
        // get groups matches
        const matches = regex.exec(request.params.page);
        if (!matches) {
          const errorResponse: FamilyRecipes.Error = {
            message: "Page not found.",
            code: "404",
          };

          return reply.status(404).send(errorResponse);
        }

        const ReportAccess = (access: boolean) => {
          if (!access) {
            const errorResponse: FamilyRecipes.Error = {
              message: "You don't have access to this page.",
              code: "403",
            };
            return reply.status(403).send(errorResponse);
          }

          return reply.status(200).send();
        };

        switch (page.auth) {
          case AuthType.bookAccess: {
            const bookId = matches[1];
            ReportAccess(await BookAccess(fastify, bookId, userId));
            break;
          }
          case AuthType.recipeAccess: {
            const recipeId = matches[1];
            ReportAccess(await RecipeAccess(fastify, recipeId, userId));
            break;
          }
          case AuthType.both: {
            const order = page.order;
            if (!order) {
              const errorResponse: FamilyRecipes.Error = {
                message:
                  "Something went wrong when trying to check your access.",
                code: "500",
              };
              return reply.status(500).send(errorResponse);
            }

            const bookIndex = order.indexOf(AuthType.bookAccess);
            const recipeIndex = order.indexOf(AuthType.recipeAccess);

            if (bookIndex === -1 || recipeIndex === -1) {
              const errorResponse: FamilyRecipes.Error = {
                message:
                  "Something went wrong when trying to check your access.",
                code: "500",
              };
              return reply.status(500).send(errorResponse);
            }

            const bookId = matches[bookIndex + 1];
            const recipeId = matches[recipeIndex + 1];

            ReportAccess(await RecipeAccess(fastify, recipeId, userId, bookId));
            break;
          }
        }
      } catch (error) {
        fastify.log.error(error);

        const errorResponse: FamilyRecipes.Error = {
          message: "Something went wrong when trying to check your access.",
          code: "500",
        };
        return reply.status(500).send(errorResponse);
      }
    }
  );
}
