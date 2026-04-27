import express from "express";

import * as leadsController from "../controllers/leads.controllers.js";

const router = express.Router();

router.route('/')
    .get()
    .post()
router.route('/:id_lead')
    .get()
    .patch()
    .delete()
router.route('/validate')
    .post()

export default router;