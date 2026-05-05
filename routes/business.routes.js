import express from "express";

import * as businessController from "../controllers/business.controllers.js";
import { getBusinessOffer, getAllBusinessOffers, createBusinessOffer, updateBusinessOffer, deleteBusinessOffer } from "../controllers/offers.controllers.js";
import {
  validateBusinessOfferCreate,
  validateOfferUpdate,
} from "../middleware/offers.middleware.js";

const router = express.Router();

router.route('/')
    .get(businessController.getAllBusiness)
    .post(businessController.createBusiness)
router.route('/:nif_nipc')
    .get(businessController.getBusiness)
    .patch(businessController.updateBusiness)
    .delete(businessController.deleteBusiness)
router.route('/:nif_nipc/offers')
    .get(getAllBusinessOffers)
    .post(validateBusinessOfferCreate, createBusinessOffer)
router.route('/:nif_nipc/offers/:id_offer')
    .get(getBusinessOffer)
    .patch(validateOfferUpdate, updateBusinessOffer)
    .delete(deleteBusinessOffer)

export default router;