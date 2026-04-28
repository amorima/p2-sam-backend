import express from "express";

import * as institutionsController from "../controllers/institutions.controllers.js";
import { createInstitutionNeed, getInstitutionNeed, getAllInstitutionNeeds, updateInstitutionNeed, deleteInstitutionNeed} from "../controllers/needs.controllers.js";

const router = express.Router();

router.route('/')
    .get(institutionsController.getAllInstitutions)
    .post(institutionsController.createInstitution)
router.route('/:nif_nipc')
    .get(institutionsController.getInstitution)
    .patch(institutionsController.updateInstitution)
    .delete(institutionsController.deleteInstitution)
router.route('/:nif_nipc/needs')
    .get(getAllInstitutionNeeds)
    .post(createInstitutionNeed)
router.route('/:nif_nipc/needs/:id_need')
    .get(getInstitutionNeed)
    .patch(updateInstitutionNeed)
    .delete(deleteInstitutionNeed)

export default router;