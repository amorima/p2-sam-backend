import express from "express";

import * as vouchersController from "../controllers/vouchers.controllers.js";
import { verifyJWT, requireRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route('/')
    .get(vouchersController.getAllVouchers)
    .post(verifyJWT, requireRoles('admin'), vouchersController.createVoucher)
router.route('/:id')
    .get(vouchersController.getVoucher)
    .patch(verifyJWT, requireRoles('admin'), vouchersController.updateVoucher)

export default router;