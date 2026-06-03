import express from "express";

import * as offersController from "../controllers/offers.controllers.js";
import { validateOfferCreate } from "../middleware/offers.middleware.js";
import { verifyJWT, requireRoles } from "../middleware/auth.middleware.js";
import { setCache, deleteCache } from "../middleware/cache.middleware.js";

const router = express.Router();

router.route('/')
    .get(setCache(120, null, 'public'), offersController.getAllOffers)
    .post(verifyJWT, requireRoles('admin'), validateOfferCreate, deleteCache('/offers'), offersController.createOffer)
router.route('/:id_offer')
    .get(offersController.getOffer)
    .patch(verifyJWT, requireRoles('admin'), deleteCache('/offers'), offersController.updateOffer)
    .delete(verifyJWT, requireRoles('admin'), deleteCache('/offers'), offersController.deleteOffer)

export default router;