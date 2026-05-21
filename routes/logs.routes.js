import express from "express";

import * as logsController from "../controllers/logs.controllers.js";
import { verifyJWT, requireRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route('/interactions')
    .get(logsController.getAllInteractionLogs)
    .post(verifyJWT, requireRoles('admin'), logsController.createInteractionLog)
router.get('/financials', verifyJWT, requireRoles('admin'), logsController.getAllFinancialLogs)
router.get('/financials/:id', verifyJWT, requireRoles('admin'), logsController.getFinancialLog)

export default router;