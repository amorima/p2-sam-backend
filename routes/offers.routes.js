import express from "express";

import * as offersController from "../controllers/offers.controllers.js";

const router = express.Router();

router.route('/')
    .get(offersController.getAllOffers)
    .post(offersController.createOffer)
router.route('/:id_offer')
    .get(offersController.getOffer)
    .patch(offersController.updateOffer)
    .delete(offersController.deleteOffer)

export default router;