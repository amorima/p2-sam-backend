import express from "express";

import * as vouchersController from "../controllers/vouchers.controllers.js";

const router = express.Router();

router.route('/')
    .get()
    .post()
router.route('/:id')
    .get()
    .patch()

export default router;