import express from "express";
import * as goodsServicesController from "../controllers/goods_services.controllers.js";
import { verifyJWT, requireRoles } from "../middleware/auth.middleware.js";
import { setCache, deleteCache } from "../middleware/cache.middleware.js";

const router = express.Router();

router.get("/", setCache(300, null, 'public'), goodsServicesController.getAllGoodsServices);
router.post("/", verifyJWT, requireRoles("admin"), deleteCache('/goods-services'), goodsServicesController.createGoodsService);
router.delete("/:tipo_bem_servico", verifyJWT, requireRoles("admin"), deleteCache('/goods-services'), goodsServicesController.deleteGoodsService);

export default router;
