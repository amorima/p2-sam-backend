import express from "express";

import * as leadsController from "../controllers/leads.controllers.js";
import { verifyInternalOrJWT, verifyJWT, requireRoles } from "../middleware/auth.middleware.js"
import { setCache, deleteCache } from "../middleware/cache.middleware.js";

const router = express.Router();

router.route('/')
    .get(verifyInternalOrJWT, setCache(15), leadsController.getAllLeads)
    .post(verifyInternalOrJWT, deleteCache('/leads'), leadsController.createLead)

// Static routes must come before /:id_lead to avoid param capture
router.get('/stats', verifyInternalOrJWT, setCache(15), leadsController.getLeadsStats)
router.post('/validate', verifyJWT, requireRoles(['admin']), deleteCache('/leads'), leadsController.validateLead)

router.route('/:id_lead')
    .get(verifyInternalOrJWT, leadsController.getLead)
    .patch(verifyJWT, requireRoles(['admin']), deleteCache('/leads'), leadsController.updateLead)
    .delete(verifyJWT, requireRoles(['admin']), deleteCache('/leads'), leadsController.deleteLead)

export default router;
