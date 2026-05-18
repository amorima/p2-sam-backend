import express from "express";

import * as needsController from "../controllers/needs.controllers.js";
import { validateNeedCreate, validateNeedUpdate } from "../middleware/needs.middleware.js";
import { verifyJWT, requireRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route('/')
    .get(needsController.getAllNeeds)
    .post(verifyJWT, requireRoles(['institution', 'admin']), validateNeedCreate, needsController.createNeed)
router.route('/:id_need')
    .get(needsController.getNeed)
    .patch(verifyJWT, requireRoles(['institution', 'admin']), validateNeedUpdate, needsController.updateNeed)
    .delete(verifyJWT, requireRoles(['institution', 'admin']), needsController.deleteNeed)

export default router;