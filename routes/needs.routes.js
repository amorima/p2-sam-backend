import express from "express";

import * as needsController from "../controllers/needs.controllers.js";
import { validateNeedCreate, validateNeedUpdate } from "../middleware/needs.middleware.js";
import { verifyInternalOrJWT, verifyJWT, requireRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route('/')
    .get(verifyInternalOrJWT, needsController.getAllNeeds)
    .post(verifyJWT, requireRoles('admin'), validateNeedCreate, needsController.createNeed)
router.route('/:id_need')
    .get(verifyJWT, needsController.getNeed)
    .patch(verifyJWT, requireRoles('admin'), validateNeedUpdate, needsController.updateNeed)
    .delete(verifyJWT, requireRoles('admin'), needsController.deleteNeed)

export default router;
