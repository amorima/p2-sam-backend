import express from "express";

import * as vouchersController from "../controllers/vouchers.controllers.js";

const router = express.Router();

router.route('/')
    .get(vouchersController.getAllVouchers)
    .post(vouchersController.createVoucher)
router.route('/:id')
    .get(vouchersController.getVoucher)
    .patch(vouchersController.updateVoucher)

export default router;