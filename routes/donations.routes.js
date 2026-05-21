import express from "express";

import * as donationsController from "../controllers/donations.controllers.js";
import { validateDonationCreate } from "../middleware/donations.middleware.js";
import { verifyInternalOrJWT, requireRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route('/')
    .get(donationsController.getAllDonations)
    .post(verifyInternalOrJWT,requireRoles('admin'),validateDonationCreate, donationsController.createDonation)
router.route('/:id_donation')
    .get(donationsController.getDonation)
    .patch(verifyInternalOrJWT,requireRoles('admin'),donationsController.updateDonation)
    .delete(verifyInternalOrJWT,requireRoles('admin'),donationsController.deleteDonation)

export default router;