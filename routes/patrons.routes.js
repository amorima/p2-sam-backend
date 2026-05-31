import express from "express";

import * as patronsController from "../controllers/patrons.controllers.js";
import { createPatronDonation, getAllPatronDonation, getPatronDonation, updatePatronDonation, deletePatronDonation} from "../controllers/donations.controllers.js";
import { validatePatronDonationCreate } from "../middleware/donations.middleware.js";
import { verifyJWT, requireRoles, adminOrSelf } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route('/')
    .get(verifyJWT, requireRoles('admin'), patronsController.getAllPatrons)
    .post(patronsController.createPatron)                                          // public: auto-registo
router.route('/:nif_nipc')
    .get(verifyJWT, adminOrSelf, patronsController.getPatron)
    .patch(verifyJWT, adminOrSelf, patronsController.updatePatron)
    .delete(verifyJWT, adminOrSelf, patronsController.deletePatron)
router.route('/:nif_nipc/donations')
    .get(verifyJWT, adminOrSelf, getAllPatronDonation)
    .post(verifyJWT, adminOrSelf, validatePatronDonationCreate, createPatronDonation)
router.route('/:nif_nipc/donations/:id_donation')
    .get(verifyJWT, adminOrSelf, getPatronDonation)
    .patch(verifyJWT, adminOrSelf, updatePatronDonation)
    .delete(verifyJWT, adminOrSelf, deletePatronDonation)

export default router;
