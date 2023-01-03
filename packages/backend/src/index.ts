import * as dotenv from "dotenv";
dotenv.config();
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyPostgres from "@fastify/postgres";
import fastifyAutoload from "@fastify/autoload";
import fastifyJwt from "@fastify/jwt";
import path from "path";
import { exit } from "process";

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
  },
  cookie: {
    cookieName: "token",
    signed: true,
  },
});

fastify.addHook("onRequest", (request) => {
  request.jwtVerify();
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "frontend"),
});

fastify.register(fastifyAutoload, { dir: path.join(__dirname, "routes") });

fastify.listen({ port: 8080, host: "0.0.0.0" }, async (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
