import express from "express";
import * as authController from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/profile', verifyJWT, authController.getProfile);
router.patch('/profile-pic', verifyJWT, authController.updateProfilePic);
router.patch('/change-password', verifyJWT, authController.changePassword);

export default router;
