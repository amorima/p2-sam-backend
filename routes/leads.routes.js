import express from "express";

import * as leadsController from "../controllers/leads.controllers.js";

const router = express.Router();

router.route('/')
    .get(leadsController.getAllLeads)
    .post(leadsController.createLead)
router.route('/:id_lead')
    .get(leadsController.getLead)
    .patch(leadsController.updateLead)
    .delete(leadsController.deleteLead)
router.route('/validate')
    .post(leadsController.validateLead)

export default router;