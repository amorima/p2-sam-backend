import express from "express";

import * as institutionsController from "../controllers/institutions.controllers.js";
import { createInstitutionNeed, getInstitutionNeed, getAllInstitutionNeeds, updateInstitutionNeed, deleteInstitutionNeed} from "../controllers/needs.controllers.js";
import { validateInstitutionNeedCreate, validateNeedUpdate } from "../middleware/needs.middleware.js";
import { verifyJWT, requireRoles} from "../middleware/auth.middleware.js"

const router = express.Router();

router.route('/')
    .get(institutionsController.getAllInstitutions)
    .post(institutionsController.createInstitution)
router.route('/:nif_nipc')
    .get(institutionsController.getInstitution)
    .patch(verifyJWT, requireRoles(['institution','admin']),institutionsController.updateInstitution)
    .delete(verifyJWT, requireRoles(['institution','admin']),institutionsController.deleteInstitution)
router.route('/:nif_nipc/needs')
    .get(getAllInstitutionNeeds)
    .post(verifyJWT, requireRoles(['institution','admin']),validateInstitutionNeedCreate, createInstitutionNeed)
router.route('/:nif_nipc/needs/:id_need')
    .get(getInstitutionNeed)
    .patch(verifyJWT, requireRoles(['business','admin']),validateNeedUpdate, updateInstitutionNeed)
    .delete(verifyJWT, requireRoles(['business','admin']),deleteInstitutionNeed)

export default router;