import express from "express";
import multer from "multer";
import * as minioController from "../controllers/minio.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = express.Router();

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/gif", "image/png"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Apenas JPG, GIF ou PNG são permitidos"));
    }
  },
});

const genericUpload = multer({ storage: multer.memoryStorage() });

router.get("/:bucket/download", verifyJWT, minioController.downloadFile);
router.get("/:bucket", verifyJWT, minioController.getPresignedUploadUrl);
router.post(
  "/:bucket",
  verifyJWT,
  (req, res, next) => {
    const middleware =
      req.params.bucket === "avatar"
        ? avatarUpload.single("file")
        : genericUpload.single("file");
    middleware(req, res, next);
  },
  minioController.uploadFile,
);

export default router;
