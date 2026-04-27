import express from "express";

import * as logsController from "../controllers/logs.controllers.js";

const router = express.Router();

router.route('/interactions')
    .get()
    .post()
router.get('/financials')
router.get('/financials/:id')

export default router;