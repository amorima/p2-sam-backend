import express from "express";

import * as donationsController from "../controllers/donations.controllers.js";

const router = express.Router();

router.route('/')
    .get(donationsController.getAllDonations)
    .post(donationsController.createDonation)
router.route('/:id_donation')
    .get(donationsController.getDonation)
    .patch(donationsController.updateDonation)
    .delete(donationsController.deleteDonation)

export default router;