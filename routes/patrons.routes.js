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
    .patch(verifyJWT, requireRoles(['patron', 'admin']), patronsController.updatePatron)
    .delete(verifyJWT, requireRoles(['patron', 'admin']), patronsController.deletePatron)
router.route('/:nif_nipc/donations')
    .get(getAllPatronDonation)
    .post(verifyJWT, requireRoles(['patron', 'admin']), validatePatronDonationCreate, createPatronDonation)
router.route('/:nif_nipc/donations/:id_donation')
    .get(getPatronDonation)
    .patch(verifyJWT, requireRoles(['patron', 'admin']), updatePatronDonation)
    .delete(verifyJWT, requireRoles(['patron', 'admin']), deletePatronDonation)

export default router;