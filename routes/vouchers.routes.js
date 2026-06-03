import express from "express";

import * as vouchersController from "../controllers/vouchers.controllers.js";
import { verifyJWT, requireRoles } from "../middleware/auth.middleware.js";
import { setCache, deleteCache } from "../middleware/cache.middleware.js";

const router = express.Router();

router.route('/')
    .get(setCache(120, null, 'public'), vouchersController.getAllVouchers)
    .post(verifyJWT, requireRoles('admin'), deleteCache('/vouchers'), vouchersController.createVoucher)
router.route('/:id')
    .get(vouchersController.getVoucher)
    .patch(verifyJWT, requireRoles('admin'), deleteCache('/vouchers'), vouchersController.updateVoucher)

export default router;