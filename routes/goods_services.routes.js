import express from "express";
import * as goodsServicesController from "../controllers/goods_services.controllers.js";
import { verifyJWT, requireRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", goodsServicesController.getAllGoodsServices);
router.post("/", verifyJWT, requireRoles("admin"), goodsServicesController.createGoodsService);
router.delete("/:tipo_bem_servico", verifyJWT, requireRoles("admin"), goodsServicesController.deleteGoodsService);

export default router;
