import express from "express";

import * as needsController from "../controllers/needs.controllers.js";

const router = express.Router();

router.route('/')
    .get(needsController.getAllNeeds)
    .post(needsController.createNeed)
router.route('/:id_need')
    .get(needsController.getNeed)
    .patch(needsController.updateNeed)
    .delete(needsController.deleteNeed)

export default router;