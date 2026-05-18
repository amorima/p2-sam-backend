import express from "express";
import * as authController from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/login', authController.login);
router.get('/profile', verifyJWT, authController.getProfile);
router.patch('/change-password', verifyJWT, authController.changePassword);

export default router;
