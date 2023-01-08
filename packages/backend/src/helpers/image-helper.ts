import type { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import GenerateImage from "./placeholder-generator";

const IMAGE_PATH = "/etc/family-recipes/images";

const Compress = async (image: Uint8Array): Promise<Uint8Array> => {
  return await sharp(image)
    .resize(1600, 1200, {
      fit: sharp.fit.outside,
    })
    .jpeg({
      mozjpeg: true,
    })
    .toBuffer();
};

const UpdateImage = async (
  fastify: FastifyInstance,
  recipe_id: string,
  image: Uint8Array
): Promise<void> => {
  try {
    // find if image exists
    const imageExists = fs.existsSync(
      path.join(IMAGE_PATH, `${recipe_id}.jpg`)
    );

    if (!imageExists) {
      throw new Error("Image does not exist.");
    }

    fs.writeFileSync(path.join(IMAGE_PATH, `${recipe_id}.jpg`), image);
  } catch (error: any) {
    fastify.log.error(error);

    throw new Error(error);
  }
};

const CreateImage = async (
  fastify: FastifyInstance,
  recipe_id: string,
  image: Uint8Array
): Promise<void> => {
  try {
    // find if image exists
    const imageExists = fs.existsSync(
      path.join(IMAGE_PATH, `${recipe_id}.jpg`)
    );

    if (imageExists) {
      throw new Error("Image already exists.");
    }

    fs.writeFileSync(path.join(IMAGE_PATH, `${recipe_id}.jpg`), image);
  } catch (error: any) {
    fastify.log.error(error);

    throw new Error(error);
  }
};

const DeleteImage = async (
  fastify: FastifyInstance,
  recipe_id: string
): Promise<void> => {
  try {
    // find if image exists
    const imageExists = fs.existsSync(
      path.join(IMAGE_PATH, `${recipe_id}.jpg`)
    );

    if (!imageExists) {
      throw new Error("Image does not exist.");
    }

    fs.unlinkSync(path.join(IMAGE_PATH, `${recipe_id}.jpg`));
  } catch (error: any) {
    fastify.log.error(error);

    throw new Error(error);
  }
};

const GetImage = async (
  fastify: FastifyInstance,
  recipe_id: string
): Promise<Uint8Array> => {
  try {
    // find if image exists
    const imageExists = fs.existsSync(
      path.join(IMAGE_PATH, `${recipe_id}.jpg`)
    );

    if (!imageExists) {
      // Generate placeholder image
      const svg = GenerateImage(recipe_id);
      // convert string to buffer
      const buffer = Buffer.from(svg, "utf-8");
      return buffer;
    }

    return fs.readFileSync(path.join(IMAGE_PATH, `${recipe_id}.jpg`));
  } catch (error: any) {
    fastify.log.error(error);

    throw new Error(error);
  }
};

export { Compress, UpdateImage, CreateImage, DeleteImage, GetImage };
