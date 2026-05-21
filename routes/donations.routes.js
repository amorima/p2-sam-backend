import express from "express";

import * as donationsController from "../controllers/donations.controllers.js";
import { validateDonationCreate } from "../middleware/donations.middleware.js";
import { verifyJWT, requireRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route('/')
    .get(donationsController.getAllDonations)
    .post(verifyJWT,requireRoles('admin'),validateDonationCreate, donationsController.createDonation)
router.route('/:id_donation')
    .get(donationsController.getDonation)
    .patch(verifyJWT,requireRoles('admin'),donationsController.updateDonation)
    .delete(verifyJWT,requireRoles('admin'),donationsController.deleteDonation)

export default router;