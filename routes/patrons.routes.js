import express from "express";

import * as patronsController from "../controllers/patrons.controllers.js";
import { createPatronDonation, getAllPatronDonation, getPatronDonation, updatePatronDonation, deletePatronDonation} from "../controllers/donations.controllers.js";
import { validatePatronDonationCreate } from "../middleware/donations.middleware.js";
import { verifyJWT, requireRoles, adminOrSelf } from "../middleware/auth.middleware.js";
import { setCache, deleteCache } from "../middleware/cache.middleware.js";

const router = express.Router();

router.route('/')
    .get(verifyJWT, requireRoles('admin'), setCache(120), patronsController.getAllPatrons)
    .post(deleteCache('/patrons'), patronsController.createPatron)                 // public: auto-registo
router.route('/:nif_nipc')
    .get(verifyJWT, adminOrSelf, patronsController.getPatron)
    .patch(verifyJWT, adminOrSelf, deleteCache('/patrons'), patronsController.updatePatron)
    .delete(verifyJWT, adminOrSelf, deleteCache('/patrons'), patronsController.deletePatron)
router.route('/:nif_nipc/donations')
    .get(verifyJWT, adminOrSelf, setCache(60), getAllPatronDonation)
    .post(verifyJWT, adminOrSelf, validatePatronDonationCreate, deleteCache('/donations'), deleteCache('/patrons'), createPatronDonation)
router.route('/:nif_nipc/donations/:id_donation')
    .get(verifyJWT, adminOrSelf, getPatronDonation)
    .patch(verifyJWT, adminOrSelf, deleteCache('/donations'), updatePatronDonation)
    .delete(verifyJWT, adminOrSelf, deleteCache('/donations'), deletePatronDonation)

export default router;
