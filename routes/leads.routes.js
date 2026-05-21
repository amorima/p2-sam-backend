import express from "express";

import * as leadsController from "../controllers/leads.controllers.js";
import { verifyInternalOrJWT, requireRoles} from "../middleware/auth.middleware.js"

const router = express.Router();

router.route('/')
    .get(leadsController.getAllLeads)
    .post(leadsController.createLead)
router.route('/:id_lead')
    .get(leadsController.getLead)
    .patch(verifyInternalOrJWT, requireRoles(['admin']),leadsController.updateLead)
    .delete(verifyInternalOrJWT, requireRoles(['admin']),leadsController.deleteLead)
router.route('/validate')
    .post(verifyInternalOrJWT, requireRoles(['admin']),leadsController.validateLead)

export default router;