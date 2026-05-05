import express from "express";

import * as needsController from "../controllers/needs.controllers.js";
import { validateNeedCreate, validateNeedUpdate } from "../middleware/needs.middleware.js";

const router = express.Router();

router.route('/')
    .get(needsController.getAllNeeds)
    .post(validateNeedCreate, needsController.createNeed)
router.route('/:id_need')
    .get(needsController.getNeed)
    .patch(validateNeedUpdate, needsController.updateNeed)
    .delete(needsController.deleteNeed)

export default router;