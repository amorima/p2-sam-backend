import express from "express";

import * as businessController from "../controllers/business.controllers.js";
import { getBusinessOffer, getAllBusinessOffers, createBusinessOffer, updateBusinessOffer, deleteBusinessOffer } from "../controllers/offers.controllers.js";
import { validateBusinessOfferCreate } from "../middleware/offers.middleware.js";
import { verifyJWT, requireRoles, adminOrSelf } from "../middleware/auth.middleware.js"

const router = express.Router();

router.route('/')
    .get(verifyJWT, requireRoles('admin'), businessController.getAllBusiness)
    .post(businessController.createBusiness)                                        // público: auto-registo
router.route('/:nif_nipc')
    .get(verifyJWT, adminOrSelf, businessController.getBusiness)
    .patch(verifyJWT, adminOrSelf, businessController.updateBusiness)
    .delete(verifyJWT, adminOrSelf, businessController.deleteBusiness)
router.route('/:nif_nipc/offers')
    .get(verifyJWT, adminOrSelf, getAllBusinessOffers)
    .post(verifyJWT, adminOrSelf, validateBusinessOfferCreate, createBusinessOffer)
router.route('/:nif_nipc/offers/:id_offer')
    .get(verifyJWT, adminOrSelf, getBusinessOffer)
    .patch(verifyJWT, adminOrSelf, updateBusinessOffer)
    .delete(verifyJWT, adminOrSelf, deleteBusinessOffer)

export default router;
