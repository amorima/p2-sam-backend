import express from "express";
import multer from "multer";
import * as minioController from "../controllers/minio.controllers.js";

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

router.get("/:bucket", minioController.getPresignedUploadUrl);
router.post("/avatar", avatarUpload.single("file"), minioController.uploadFile);
router.post("/:bucket", genericUpload.single("file"), minioController.uploadFile);

export default router;