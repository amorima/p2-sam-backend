import express from "express";

import * as offersController from "../controllers/offers.controllers.js";

const router = express.Router();

router.route('/')
    .get()
    .post()
router.route('/:id_offer')
    .get()
    .patch()
    .delete()

export default router;