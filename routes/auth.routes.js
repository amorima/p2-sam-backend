import express from "express";
import multer from "multer";
import * as authController from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/gif", "image/png"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Apenas JPG, GIF ou PNG são permitidos"));
    }
  },
});

router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/profile', verifyJWT, authController.getProfile);
router.patch('/profile-pic', verifyJWT, authController.updateProfilePic);
router.patch('/avatar', verifyJWT, avatarUpload.single('file'), authController.updateAvatar);
router.patch('/change-password', verifyJWT, authController.changePassword);

export default router;
