import express from "express";

import * as needsController from "../controllers/needs.controllers.js";
import { validateNeedCreate, validateNeedUpdate } from "../middleware/needs.middleware.js";
import { verifyInternalOrJWT, verifyJWT, requireRoles } from "../middleware/auth.middleware.js";
import { setCache, deleteCache } from "../middleware/cache.middleware.js";

const router = express.Router();

router.route('/')
    .get(verifyInternalOrJWT, setCache(30), needsController.getAllNeeds)
    .post(verifyJWT, requireRoles('admin'), validateNeedCreate, deleteCache('/needs'), needsController.createNeed)
router.route('/:id_need')
    .get(verifyJWT, needsController.getNeed)
    .patch(verifyJWT, requireRoles('admin'), validateNeedUpdate, deleteCache('/needs'), needsController.updateNeed)
    .delete(verifyJWT, requireRoles('admin'), deleteCache('/needs'), needsController.deleteNeed)

export default router;
