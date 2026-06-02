import express from "express";

import * as leadsController from "../controllers/leads.controllers.js";
import { verifyInternalOrJWT, verifyJWT, requireRoles } from "../middleware/auth.middleware.js"

const router = express.Router();

router.route('/')
    .get(verifyInternalOrJWT, leadsController.getAllLeads)
    .post(verifyInternalOrJWT, leadsController.createLead)

// Static routes must come before /:id_lead to avoid param capture
router.post('/validate', verifyJWT, requireRoles(['admin']), leadsController.validateLead)

router.route('/:id_lead')
    .get(verifyInternalOrJWT, leadsController.getLead)
    .patch(verifyJWT, requireRoles(['admin']), leadsController.updateLead)
    .delete(verifyJWT, requireRoles(['admin']), leadsController.deleteLead)

export default router;
