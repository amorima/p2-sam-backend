import express from "express";

import * as businessController from "../controllers/business.controllers.js";
import {} from "../controllers/offers.controllers.js";

const router = express.Router();

router.route('/')
    .get()
    .post()
router.route('/:nif_nipc')
    .get()
    .patch()
    .delete()
router.route('/:nif_nipc/offers')
    .get()
    .post()
router.route('/:nif_nipc/offers/:id_offer')
    .get()
    .patch()
    .delete()

export default router;