import express from "express";
import * as goodsServicesController from "../controllers/goods_services.controllers.js";

const router = express.Router();

router.get("/", goodsServicesController.getAllGoodsServices);

export default router;
