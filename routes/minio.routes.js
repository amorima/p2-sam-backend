import express from "express";
import * as minioController from "../controllers/minio.controllers.js";

const router = express.Router();

router.get("/:bucket", minioController.getPresignedUploadUrl);
router.post("/:bucket", express.raw({ type: "*/*", limit: "10mb" }), minioController.uploadFile);

export default router;