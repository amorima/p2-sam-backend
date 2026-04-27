import express from "express";

import * as institutionsController from "../controllers/institutions.controllers.js";

const router = express.Router();

router.route('/')
    .get()
    .post()
router.route('/:nif_nipc')
    .get()
    .patch()
    .delete()
router.route('/:nif_nipc/needs')
    .get()
    .post()
router.route('/:nif_nipc/needs/:id_need')
    .get()
    .patch()
    .delete()

export default router;