import express from "express";

import * as needsController from "../controllers/needs.controllers.js";

const router = express.Router();

router.route('/')
    .get()
    .post()
router.route('/:id_need')
    .get()
    .patch()
    .delete()

export default router;