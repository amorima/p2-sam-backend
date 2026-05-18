import express from "express";

import * as businessController from "../controllers/business.controllers.js";
import { getBusinessOffer, getAllBusinessOffers, createBusinessOffer, updateBusinessOffer, deleteBusinessOffer } from "../controllers/offers.controllers.js";
import { validateBusinessOfferCreate } from "../middleware/offers.middleware.js";
import { verifyJWT, requireRoles} from "../middleware/auth.middleware.js"

const router = express.Router();

router.route('/')
    .get(businessController.getAllBusiness)
    .post(businessController.createBusiness)
router.route('/:nif_nipc')
    .get(businessController.getBusiness)
    .patch(verifyJWT, requireRoles(['business','admin']),businessController.updateBusiness)
    .delete(verifyJWT, requireRoles(['business','admin']),businessController.deleteBusiness)
router.route('/:nif_nipc/offers')
    .get(getAllBusinessOffers)
    .post(verifyJWT, requireRoles(['business','admin']),validateBusinessOfferCreate, createBusinessOffer)
router.route('/:nif_nipc/offers/:id_offer')
    .get(getBusinessOffer)
    .patch(verifyJWT, requireRoles(['business','admin']),updateBusinessOffer)
    .delete(verifyJWT, requireRoles(['business','admin']),deleteBusinessOffer)

export default router;