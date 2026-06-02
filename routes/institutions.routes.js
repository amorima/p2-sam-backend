import express from "express";

import * as institutionsController from "../controllers/institutions.controllers.js";
import { createInstitutionNeed, getInstitutionNeed, getAllInstitutionNeeds, updateInstitutionNeed, deleteInstitutionNeed} from "../controllers/needs.controllers.js";
import { validateInstitutionNeedCreate, validateNeedUpdate } from "../middleware/needs.middleware.js";
import { verifyInternalOrJWT, verifyJWT, requireRoles, adminOrSelf } from "../middleware/auth.middleware.js"

const router = express.Router();

router.route('/')
    .get(verifyInternalOrJWT, institutionsController.getAllInstitutions)
    .post(institutionsController.createInstitution)                                 // público: auto-registo
router.route('/:nif_nipc')
    .get(verifyJWT, adminOrSelf, institutionsController.getInstitution)
    .patch(verifyJWT, adminOrSelf, institutionsController.updateInstitution)
    .delete(verifyJWT, adminOrSelf, institutionsController.deleteInstitution)
router.route('/:nif_nipc/needs')
    .get(verifyJWT, adminOrSelf, getAllInstitutionNeeds)
    .post(verifyJWT, adminOrSelf, validateInstitutionNeedCreate, createInstitutionNeed)
router.route('/:nif_nipc/needs/:id_need')
    .get(verifyJWT, adminOrSelf, getInstitutionNeed)
    .patch(verifyJWT, adminOrSelf, validateNeedUpdate, updateInstitutionNeed)
    .delete(verifyJWT, adminOrSelf, deleteInstitutionNeed)

export default router;
