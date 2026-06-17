import express from "express";

import * as needsController from "../controllers/needs.controllers.js";
import { validateNeedCreate, validateNeedUpdate } from "../middleware/needs.middleware.js";
import { verifyInternalOrJWT, verifyJWT, requireRoles } from "../middleware/auth.middleware.js";
import { setCache, deleteCache } from "../middleware/cache.middleware.js";

const router = express.Router();

router.route('/')
    .get(verifyInternalOrJWT, setCache(30), needsController.getAllNeeds)
    .post(verifyJWT, requireRoles('admin'), validateNeedCreate, deleteCache('/needs'), deleteCache('/goods-services'), needsController.createNeed)
// Static routes must precede /:id_need to avoid param capture
router.get('/stats', verifyInternalOrJWT, setCache(30), needsController.getNeedsStats)
router.get('/item-vouchers', verifyInternalOrJWT, setCache(30), needsController.getItemVouchers)
router.patch('/:id_need/business-response', verifyJWT, requireRoles(['admin', 'business']), deleteCache('/needs'), needsController.businessResponse)
router.route('/:id_need')
    .get(verifyJWT, needsController.getNeed)
    .patch(verifyJWT, requireRoles('admin'), validateNeedUpdate, deleteCache('/needs'), deleteCache('/goods-services'), needsController.updateNeed)
    .delete(verifyJWT, requireRoles('admin'), deleteCache('/needs'), needsController.deleteNeed)

export default router;
