import express from "express";

import * as patronsController from "../controllers/patrons.controllers.js";
import { createPatronDonation, getAllPatronDonation, getPatronDonation, updatePatronDonation, deletePatronDonation} from "../controllers/donations.controllers.js";
import { validatePatronDonationCreate } from "../middleware/donations.middleware.js";
import { verifyJWT, verifyInternalOrJWT, requireRoles, adminOrSelf } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route('/')
    .get(patronsController.getAllPatrons)
    .post(patronsController.createPatron)
router.route('/:nif_nipc')
    .get(patronsController.getPatron)
    .patch(verifyInternalOrJWT, adminOrSelf, patronsController.updatePatron)
    .delete(verifyInternalOrJWT, adminOrSelf, patronsController.deletePatron)
router.route('/:nif_nipc/donations')
    .get(getAllPatronDonation)
    .post(verifyInternalOrJWT, adminOrSelf, validatePatronDonationCreate, createPatronDonation)
router.route('/:nif_nipc/donations/:id_donation')
    .get(getPatronDonation)
    .patch(verifyInternalOrJWT, adminOrSelf, updatePatronDonation)
    .delete(verifyInternalOrJWT, adminOrSelf, deletePatronDonation)

export default router;