import type { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const IMAGE_PATH = path.join(__dirname, "/frontend/public/images/");

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

export { Compress, UpdateImage, CreateImage, DeleteImage };
