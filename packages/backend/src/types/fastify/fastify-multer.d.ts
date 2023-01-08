import {
  Field,
  File,
  FilesObject,
  Options,
  FileFilter,
  FileFilterCallback,
  Setup,
  StorageEngine,
} from "./fastify-multer-interfaces";
type FilesInRequest = FilesObject | Partial<File>[];

declare module "fastify" {
  interface FastifyRequest {
    isMultipart: typeof isMultipart;
    file: File;
    files: FilesInRequest;
  }
}
