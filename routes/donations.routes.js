import express from "express";

import * as donationsController from "../controllers/donations.controllers.js";
import { validateDonationCreate } from "../middleware/donations.middleware.js";
import { verifyJWT, requireRoles } from "../middleware/auth.middleware.js";
import { setCache, deleteCache } from "../middleware/cache.middleware.js";

const router = express.Router();

router.route('/')
    .get(verifyJWT, requireRoles('admin'), setCache(60), donationsController.getAllDonations)
    .post(verifyJWT, requireRoles('admin'), validateDonationCreate, deleteCache('/donations'), donationsController.createDonation)
// Static route must precede /:id_donation so "stats" isn't captured as an id.
router.get('/stats', verifyJWT, requireRoles('admin'), setCache(60), donationsController.getDonationStats)
router.route('/:id_donation')
    .get(verifyJWT, requireRoles('admin'), donationsController.getDonation)
    .patch(verifyJWT, requireRoles('admin'), deleteCache('/donations'), donationsController.updateDonation)
    .delete(verifyJWT, requireRoles('admin'), deleteCache('/donations'), donationsController.deleteDonation)

export default router;
