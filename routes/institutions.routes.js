import express from "express";

import * as institutionsController from "../controllers/institutions.controllers.js";
import { createInstitutionNeed, getInstitutionNeed, getAllInstitutionNeeds, updateInstitutionNeed, deleteInstitutionNeed} from "../controllers/needs.controllers.js";
import { validateInstitutionNeedCreate, validateNeedUpdate } from "../middleware/needs.middleware.js";
import { verifyJWT, requireRoles, adminOrSelf } from "../middleware/auth.middleware.js"

const router = express.Router();

router.route('/')
    .get(institutionsController.getAllInstitutions)
    .post(institutionsController.createInstitution)
router.route('/:nif_nipc')
    .get(institutionsController.getInstitution)
    .patch(verifyJWT, adminOrSelf, institutionsController.updateInstitution)
    .delete(verifyJWT, adminOrSelf, institutionsController.deleteInstitution)
router.route('/:nif_nipc/needs')
    .get(getAllInstitutionNeeds)
    .post(verifyJWT, adminOrSelf, validateInstitutionNeedCreate, createInstitutionNeed)
router.route('/:nif_nipc/needs/:id_need')
    .get(getInstitutionNeed)
    .patch(verifyJWT, adminOrSelf, validateNeedUpdate, updateInstitutionNeed)
    .delete(verifyJWT, adminOrSelf, deleteInstitutionNeed)

export default router;