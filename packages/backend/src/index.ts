import { init } from "./helpers/tracing";
init("family-recipes", "production");
import * as dotenv from "dotenv";
dotenv.config();
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyPostgres from "@fastify/postgres";
import fastifyAutoload from "@fastify/autoload";
import fastifyJwt from "@fastify/jwt";
import fastifyMulter from "fastify-multer";
import jwtAuth from "./auth/jwt-auth";
import recipeAccessAuth from "./auth/recipe-access-auth";
import userAccessAuth from "./auth/user-access-auth";
import recipeBookAccessAuth from "./auth/recipe-book-access-auth";
import commentAccessAuth from "./auth/comment-access-auth";
import path from "path";
import { exit } from "process";
import fs from "fs";
// create folder for uploads if it doesn't exist
if (!fs.existsSync("/etc/family-recipes/images/tmp")) {
  fs.mkdirSync("/etc/family-recipes/images/tmp", {
    recursive: true,
  });
}

const storage = fastifyMulter.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/etc/family-recipes/images/tmp");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});
export const upload = fastifyMulter({ storage: storage });

if (process.env.INSECURE) {
  console.log("WARNING: Insecure mode is enabled");
  console.log("WARNING: This should only be used for development");
}

if (!process.env.DATABASE_URL) {
  console.log("Environment variable DATABASE_URL is not set");
  exit();
}
if (!process.env.PRIVATE_KEY) {
  console.log("Environment variable PRIVATE_KEY is not set");
  exit();
}
if (!process.env.PUBLIC_KEY) {
  console.log("Environment variable PUBLIC_KEY is not set");
  exit();
}
if (!process.env.KEY_ALGORITHM) {
  console.log("Environment variable KEY_ALGORITHM is not set");
  exit();
}
if (!process.env.COOKIE_SECRET) {
  console.log("Environment variable COOKIE_SECRET is not set");
  exit();
}

const fastify = Fastify({
  logger: {
    transport: {
      target: "@fastify/one-line-logger",
    },
  },
});

fastify.register(fastifyPostgres, {
  connectionString: process.env.DATABASE_URL,
});

fastify.register(require("@fastify/cookie"));

fastify.register(fastifyJwt, {
  secret: {
    private: process.env.PRIVATE_KEY,
    public: process.env.PUBLIC_KEY,
  },
  sign: {
    algorithm: process.env.KEY_ALGORITHM,
    expiresIn: "14d",
  },
  cookie: {
    cookieName: "token",
    signed: false,
  },
  messages: {
    noAuthorizationInHeaderMessage: "Not authorized",
    noAuthorizationInCookieMessage: "Not authorized",
    authorizationTokenExpiredMessage: "Not authorized",
    invalidAuthorizationTokenMessage: "Not authorized",
  },
});

fastify.register(fastifyMulter.contentParser, {});

fastify.register(jwtAuth);
fastify.register(userAccessAuth);
fastify.register(recipeAccessAuth);
fastify.register(recipeBookAccessAuth);
fastify.register(commentAccessAuth);

fastify.addHook("onRequest", async (request, reply) => {
  if (request.cookies.token) {
    try {
      const decoded = await request.jwtVerify();
      const exp = decoded.exp;
      // if the token is within 7 day of expiring, refresh it
      if (exp - Date.now() / 1000 < 60 * 60 * 24 * 7) {
        const token = await reply.jwtSign({ userId: decoded.userId });
        return reply.setCookie("token", token, {
          domain: process.env.DOMAIN ?? "localhost",
          path: "/",
          secure: process.env.INSECURE ? false : true,
          httpOnly: true,
          sameSite: true,
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        });
      }
    } catch (error) {}
  }
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "frontend"),
});

fastify.get("/", async (request, reply) => {
  if (request.user) {
    return reply.redirect("/books");
  }
  return reply.sendFile("index.html", path.join(__dirname, "frontend"));
});

fastify.get("/books", async (request, reply) => {
  if (request.user) {
    return reply.sendFile("index.html", path.join(__dirname, "frontend"));
  }
  return reply.redirect("/");
});

fastify.get("/book/:recipeBookId", async (request, reply) => {
  if (request.user) {
    return reply.sendFile("index.html", path.join(__dirname, "frontend"));
  }
  return reply.redirect("/");
});

fastify.get("/recipe/:recipeId", async (request, reply) => {
  if (request.user) {
    return reply.sendFile("index.html", path.join(__dirname, "frontend"));
  }
  return reply.redirect("/");
});

fastify.register(fastifyAutoload, {
  dir: path.join(__dirname, "routes"),
  routeParams: true,
});

fastify.listen({ port: 8080, host: "0.0.0.0" }, async (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
