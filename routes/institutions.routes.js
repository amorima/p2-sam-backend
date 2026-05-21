import express from "express";

import * as institutionsController from "../controllers/institutions.controllers.js";
import { createInstitutionNeed, getInstitutionNeed, getAllInstitutionNeeds, updateInstitutionNeed, deleteInstitutionNeed} from "../controllers/needs.controllers.js";
import { validateInstitutionNeedCreate, validateNeedUpdate } from "../middleware/needs.middleware.js";
import { verifyInternalOrJWT, requireRoles, adminOrSelf } from "../middleware/auth.middleware.js"

const router = express.Router();

router.route('/')
    .get(institutionsController.getAllInstitutions)
    .post(institutionsController.createInstitution)
router.route('/:nif_nipc')
    .get(institutionsController.getInstitution)
    .patch(verifyInternalOrJWT, adminOrSelf, institutionsController.updateInstitution)
    .delete(verifyInternalOrJWT, adminOrSelf, institutionsController.deleteInstitution)
router.route('/:nif_nipc/needs')
    .get(getAllInstitutionNeeds)
    .post(verifyInternalOrJWT, adminOrSelf, validateInstitutionNeedCreate, createInstitutionNeed)
router.route('/:nif_nipc/needs/:id_need')
    .get(getInstitutionNeed)
    .patch(verifyInternalOrJWT, adminOrSelf, validateNeedUpdate, updateInstitutionNeed)
    .delete(verifyInternalOrJWT, adminOrSelf, deleteInstitutionNeed)

export default router;