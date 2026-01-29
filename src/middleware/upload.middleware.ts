import multer from "multer";
import uuid from "uuid";
import { Request } from "express";
import path from "path";
import fs from "fs";
import { HttpError } from "../errors/http.error";

// uploads/users
const uploadDir = path.join(process.cwd(), "uploads", "users");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },

  filename: function (_req, file, cb) {
    const fileSuffix = uuid.v4();
    cb(null, fileSuffix + "-" + file.originalname);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new HttpError(400, "Only image files are allowed"));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  fileFilter,
});

export const uploads = {
  single: (fieldName: string) => upload.single(fieldName),
  array: (fieldName: string, maxCount: number) =>
    upload.array(fieldName, maxCount),
  fields: (fields: { name: string; maxCount?: number }[]) =>
    upload.fields(fields),
};
