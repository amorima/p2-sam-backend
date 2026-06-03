import express from "express";

import * as logsController from "../controllers/logs.controllers.js";
import { verifyJWT, requireRoles } from "../middleware/auth.middleware.js";
import { setCache, deleteCache } from "../middleware/cache.middleware.js";

const router = express.Router();

router.route('/interactions')
    .get(verifyJWT, setCache(120), logsController.getAllInteractionLogs)
    .post(verifyJWT, requireRoles('admin'), deleteCache('/logs'), logsController.createInteractionLog)
router.get('/financials', verifyJWT, requireRoles('admin'), setCache(120), logsController.getAllFinancialLogs)
router.get('/financials/:id', verifyJWT, requireRoles('admin'), logsController.getFinancialLog)

export default router;