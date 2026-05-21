import express from "express";

import * as needsController from "../controllers/needs.controllers.js";
import { validateNeedCreate, validateNeedUpdate } from "../middleware/needs.middleware.js";
import { verifyInternalOrJWT, requireRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route('/')
    .get(needsController.getAllNeeds)
    .post(verifyInternalOrJWT, requireRoles('admin'), validateNeedCreate, needsController.createNeed)
router.route('/:id_need')
    .get(needsController.getNeed)
    .patch(verifyInternalOrJWT, requireRoles('admin'), validateNeedUpdate, needsController.updateNeed)
    .delete(verifyInternalOrJWT, requireRoles('admin'), needsController.deleteNeed)

export default router;