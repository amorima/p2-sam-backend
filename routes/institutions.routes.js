import express from "express";

import * as institutionsController from "../controllers/institutions.controllers.js";
import { createInstitutionNeed, getInstitutionNeed, getAllInstitutionNeeds, updateInstitutionNeed, deleteInstitutionNeed} from "../controllers/needs.controllers.js";
import { validateInstitutionNeedCreate, validateNeedUpdate } from "../middleware/needs.middleware.js";
import { verifyInternalOrJWT, verifyJWT, requireRoles, adminOrSelf } from "../middleware/auth.middleware.js"
import { setCache, deleteCache } from "../middleware/cache.middleware.js";

const router = express.Router();

router.route('/')
    .get(verifyInternalOrJWT, setCache(120), institutionsController.getAllInstitutions)
    .post(deleteCache('/institutions'), institutionsController.createInstitution)   // público: auto-registo
router.route('/:nif_nipc')
    .get(verifyJWT, adminOrSelf, institutionsController.getInstitution)
    .patch(verifyJWT, adminOrSelf, deleteCache('/institutions'), institutionsController.updateInstitution)
    .delete(verifyJWT, adminOrSelf, deleteCache('/institutions'), institutionsController.deleteInstitution)
router.route('/:nif_nipc/needs')
    .get(verifyJWT, adminOrSelf, setCache(30), getAllInstitutionNeeds)
    .post(verifyJWT, adminOrSelf, validateInstitutionNeedCreate, deleteCache('/needs'), deleteCache('/institutions'), createInstitutionNeed)
router.route('/:nif_nipc/needs/:id_need')
    .get(verifyJWT, adminOrSelf, getInstitutionNeed)
    .patch(verifyJWT, adminOrSelf, validateNeedUpdate, deleteCache('/needs'), updateInstitutionNeed)
    .delete(verifyJWT, adminOrSelf, deleteCache('/needs'), deleteInstitutionNeed)

export default router;
