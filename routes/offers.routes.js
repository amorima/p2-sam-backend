import express from "express";

import * as offersController from "../controllers/offers.controllers.js";
import { validateOfferCreate } from "../middleware/offers.middleware.js";
import { verifyJWT, requireRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route('/')
    .get(offersController.getAllOffers)
    .post(verifyJWT, requireRoles('admin'), validateOfferCreate, offersController.createOffer)
router.route('/:id_offer')
    .get(offersController.getOffer)
    .patch(verifyJWT, requireRoles('admin'), offersController.updateOffer)
    .delete(verifyJWT, requireRoles('admin'), offersController.deleteOffer)

export default router;