import express from "express";

import * as patronsController from "../controllers/patrons.controllers.js";
import { createPatronDonation, getAllPatronDonation, getPatronDonation, updatePatronDonation, deletePatronDonation} from "../controllers/donations.controllers.js";
import { validatePatronDonationCreate } from "../middleware/donations.middleware.js";
import { verifyJWT, requireRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route('/')
    .get(patronsController.getAllPatrons)
    .post(patronsController.createPatron)
router.route('/:nif_nipc')
    .get(patronsController.getPatron)
    .patch(verifyJWT, adminOrSelf, patronsController.updatePatron)
    .delete(verifyJWT, adminOrSelf, patronsController.deletePatron)
router.route('/:nif_nipc/donations')
    .get(getAllPatronDonation)
    .post(verifyJWT, adminOrSelf, validatePatronDonationCreate, createPatronDonation)
router.route('/:nif_nipc/donations/:id_donation')
    .get(getPatronDonation)
    .patch(verifyJWT, adminOrSelf, updatePatronDonation)
    .delete(verifyJWT, adminOrSelf, deletePatronDonation)

export default router;