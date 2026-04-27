import express from "express";

import * as patronsController from "../controllers/patrons.controllers.js";

const router = express.Router();

router.route('/')
    .get()
    .post()
router.route('/:nif_nipc')
    .get()
    .patch()
    .delete()
router.route('/:nif_nipc/donations')
    .get()
    .post()
router.route('/:nif_nipc/donations/:id_donation')
    .get()
    .patch()
    .delete()

export default router;