import express from "express";

import * as patronsController from "../controllers/patrons.controllers.js";
import { createPatronDonation, getAllPatronDonation, getPatronDonation, updatePatronDonation, deletePatronDonation} from "../controllers/donations.controllers.js";

const router = express.Router();

router.route('/')
    .get(patronsController.getAllPatrons)
    .post(patronsController.createPatron)
router.route('/:nif_nipc')
    .get(patronsController.getPatron)
    .patch(patronsController.updatePatron)
    .delete(patronsController.deletePatron)
router.route('/:nif_nipc/donations')
    .get(getAllPatronDonation)
    .post(createPatronDonation)
router.route('/:nif_nipc/donations/:id_donation')
    .get(getPatronDonation)
    .patch(updatePatronDonation)
    .delete(deletePatronDonation)

export default router;