import express from "express";

import * as businessController from "../controllers/business.controllers.js";
import { getBusinessOffer, getAllBusinessOffers, createBusinessOffer, updateBusinessOffer, deleteBusinessOffer } from "../controllers/offers.controllers.js";
import { validateBusinessOfferCreate } from "../middleware/offers.middleware.js";
import { verifyJWT, requireRoles, adminOrSelf } from "../middleware/auth.middleware.js"
import { setCache, deleteCache } from "../middleware/cache.middleware.js";

const router = express.Router();

router.route('/')
    .get(verifyJWT, requireRoles('admin'), setCache(120), businessController.getAllBusiness)
    .post(deleteCache('/business'), businessController.createBusiness)              // público: auto-registo
router.route('/:nif_nipc')
    .get(verifyJWT, adminOrSelf, businessController.getBusiness)
    .patch(verifyJWT, adminOrSelf, deleteCache('/business'), businessController.updateBusiness)
    .delete(verifyJWT, adminOrSelf, deleteCache('/business'), businessController.deleteBusiness)
router.route('/:nif_nipc/offers')
    .get(verifyJWT, adminOrSelf, setCache(120), getAllBusinessOffers)
    .post(verifyJWT, adminOrSelf, validateBusinessOfferCreate, deleteCache('/business'), createBusinessOffer)
router.route('/:nif_nipc/offers/:id_offer')
    .get(verifyJWT, adminOrSelf, getBusinessOffer)
    .patch(verifyJWT, adminOrSelf, deleteCache('/business'), updateBusinessOffer)
    .delete(verifyJWT, adminOrSelf, deleteCache('/business'), deleteBusinessOffer)

export default router;
