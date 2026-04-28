import express from "express";

import * as logsController from "../controllers/logs.controllers.js";

const router = express.Router();

router.route('/interactions')
    .get(logsController.getAllInteractionLogs)
    .post(logsController.createInteractionLog)
router.get('/financials', logsController.getAllFinancialLogs)
router.get('/financials/:id', logsController.getFinancialLog)

export default router;