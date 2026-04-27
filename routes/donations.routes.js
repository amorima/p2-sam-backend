import express from "express";

import * as donationsController from "../controllers/donations.controllers.js";

const router = express.Router();

router.route('/')
    .get()
    .post()
router.route('/:id_donation')
    .get()
    .patch()
    .delete()

export default router;