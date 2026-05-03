import express from "express";
import * as minioController from "../controllers/minio.controllers.js";

const router = express.Router();

router.get("/:bucket", minioController.getPresignedUploadUrl);

export default router;