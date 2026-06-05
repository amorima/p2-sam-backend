import { Entities, RefreshTokens } from "../models/db.config.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateTokenFamily,
} from "../utils/auth.utils.js";
import {
  genericError,
  unauthorizedError,
  forbiddenError,
  missingFieldError,
  validationError,
} from "../utils/error.utils.js";
import {
  minioClient,
  buildPublicUrl,
  removeObjectSafe,
  removeAllWithPrefix,
} from "../utils/minio.utils.js";

const AVATAR_BUCKET = "avatar";

const extensionFromMime = (mime) => {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
};

export const login = async (req, res, next) => {
  try {
    const { email_login, nif_nipc, password } = req.body;

    if ((!email_login && !nif_nipc) || !password) {
      return next(missingFieldError(["email_login or nif_nipc", "password"]));
    }

    const where = nif_nipc ? { nif_nipc } : { email_login };
    const entity = await Entities.findOne({ where });

    if (!entity) {
      return next(unauthorizedError("Invalid credentials"));
    }

    const isPasswordValid = await comparePassword(password, entity.password);

    if (!isPasswordValid) {
      return next(unauthorizedError("Invalid credentials"));
    }

    if (entity.blocked) {
      return next(forbiddenError(entity.reason || "Account suspended"));
    }

    const payload = {
      nif_nipc: entity.nif_nipc,
      email_login: entity.email_login,
      role: entity.role,
    };

    // Generate access token (short-lived, default 15 minutes)
    const accessToken = generateToken(payload);

    // Generate refresh token (long-lived, default 7 days)
    const refreshToken = generateRefreshToken(payload);
    const tokenFamily = generateTokenFamily();

    // Store refresh token in database with metadata
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await RefreshTokens.create({
      entidade_nif_nipc: entity.nif_nipc,
      token: refreshToken,
      tokenFamily,
      expiresAt,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      expiresIn: 900,
      refreshExpiresIn: 604800,
      tokenType: "Bearer",
      entity: {
        nif_nipc: entity.nif_nipc,
        email_login: entity.email_login,
        nome_entidade: entity.nome_entidade,
        role: entity.role,
        profile_pic: entity.profile_pic ?? null,
      },
    });
  } catch (error) {
    next(genericError("Error during login: " + error.message));
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const entity = await Entities.findByPk(req.user.nif_nipc);

    if (!entity) {
      return next(unauthorizedError("User not found"));
    }

    res.status(200).json({
      nif_nipc: entity.nif_nipc,
      email_login: entity.email_login,
      nome_entidade: entity.nome_entidade,
      role: entity.role,
      profile_pic: entity.profile_pic,
      iban: entity.iban,
    });
  } catch (error) {
    next(genericError("Error fetching profile: " + error.message));
  }
};

export const updateProfilePic = async (req, res, next) => {
  try {
    const { profile_pic } = req.body;
    const entity = await Entities.findByPk(req.user.nif_nipc);
    if (!entity) return next(unauthorizedError("User not found"));
    await entity.update({ profile_pic: profile_pic ?? null });
    res.json({ profile_pic });
  } catch (error) {
    next(genericError("Error updating profile picture: " + error.message));
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(missingFieldError(["file"]));
    }

    const entity = await Entities.findByPk(req.user.nif_nipc);
    if (!entity) return next(unauthorizedError("User not found"));

    const previousFileName = entity.profile_pic;
    const extension = extensionFromMime(req.file.mimetype);
    const newFileName = `${entity.nif_nipc}_${Date.now()}.${extension}`;

    console.log(
      `[updateAvatar] nif=${entity.nif_nipc} previous=${previousFileName ?? "<none>"} new=${newFileName}`,
    );

    // Upload first, then sweep. Two cleanup strategies combined:
    //   1) The exact name stored in profile_pic — covers legacy uploads that
    //      kept the original filename.
    //   2) Anything in the avatar bucket whose key starts with `<nif>_` —
    //      covers leftovers from prior requests whose cleanup failed, or
    //      whose profile_pic row drifted from the stored object. The new
    //      file is excluded from the sweep.
    await minioClient.putObject(AVATAR_BUCKET, newFileName, req.file.buffer, {
      "Content-Type": req.file.mimetype,
    });

    await entity.update({ profile_pic: newFileName });

    if (previousFileName && previousFileName !== newFileName) {
      await removeObjectSafe(AVATAR_BUCKET, previousFileName);
    }
    await removeAllWithPrefix(AVATAR_BUCKET, `${entity.nif_nipc}_`, [
      newFileName,
    ]);

    res.json({
      success: true,
      profile_pic: newFileName,
      fileName: newFileName,
      url: buildPublicUrl(AVATAR_BUCKET, newFileName),
      bucket: AVATAR_BUCKET,
    });
  } catch (error) {
    next(genericError("Error updating avatar: " + error.message));
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const nif_nipc = req.user.nif_nipc;

    if (!currentPassword || !newPassword) {
      return next(missingFieldError(["currentPassword", "newPassword"]));
    }

    if (newPassword.length < 8) {
      return next(
        validationError([
          { newPassword: "Password must be at least 8 characters long" },
        ]),
      );
    }

    if (!/[A-Z]/.test(newPassword)) {
      return next(
        validationError([
          {
            newPassword: "Password must contain at least one uppercase letter",
          },
        ]),
      );
    }

    if (!/[a-z]/.test(newPassword)) {
      return next(
        validationError([
          {
            newPassword: "Password must contain at least one lowercase letter",
          },
        ]),
      );
    }

    if (!/[0-9]/.test(newPassword)) {
      return next(
        validationError([
          { newPassword: "Password must contain at least one number" },
        ]),
      );
    }

    if (!/[!@#$%^&*]/.test(newPassword)) {
      return next(
        validationError([
          {
            newPassword:
              "Password must contain at least one special character (!@#$%^&*)",
          },
        ]),
      );
    }

    const entity = await Entities.findByPk(nif_nipc);

    if (!entity) {
      return next(unauthorizedError("User not found"));
    }

    const isPasswordValid = await comparePassword(
      currentPassword,
      entity.password,
    );

    if (!isPasswordValid) {
      return next(unauthorizedError("Current password is incorrect"));
    }

    const hashedPassword = await hashPassword(newPassword);
    await entity.update({ password: hashedPassword });

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    next(genericError("Error changing password: " + error.message));
  }
};

/**
 * Refresh access token using refresh token (with token rotation)
 * Hybrid variant: Issues new refresh token to enable rotation and detect reuse attacks
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: incomingRefreshToken } = req.body;

    if (!incomingRefreshToken) {
      return next(missingFieldError(["refreshToken"]));
    }

    // Verify refresh token signature
    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch (error) {
      return next(unauthorizedError("Invalid or expired refresh token"));
    }

    // Check if refresh token exists and is not revoked
    const storedToken = await RefreshTokens.findOne({
      token: incomingRefreshToken,
    });

    if (!storedToken) {
      return next(unauthorizedError("Refresh token not found"));
    }

    if (storedToken.revoked) {
      // Token reuse detected - security concern
      // Revoke all tokens in this family
      await RefreshTokens.updateMany(
        {
          tokenFamily: storedToken.tokenFamily,
          entidade_nif_nipc: storedToken.entidade_nif_nipc,
        },
        { revoked: true, revokedAt: new Date() },
      );
      return next(
        unauthorizedError(
          "Token reuse detected. All tokens have been revoked. Please login again.",
        ),
      );
    }

    // Check expiration
    if (new Date() > storedToken.expiresAt) {
      return next(unauthorizedError("Refresh token has expired"));
    }

    // Verify user still exists
    const entity = await Entities.findByPk(decoded.nif_nipc);
    if (!entity) {
      return next(unauthorizedError("User not found"));
    }

    if (entity.blocked) {
      return next(forbiddenError(entity.reason || "Account suspended"));
    }

    // Generate new tokens (token rotation)
    const payload = {
      nif_nipc: entity.nif_nipc,
      email_login: entity.email_login,
      role: entity.role,
    };

    const newAccessToken = generateToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Revoke old refresh token
    await RefreshTokens.findByIdAndUpdate(storedToken._id, {
      revoked: true,
      revokedAt: new Date(),
    });

    // Store new refresh token with same family ID (for tracking rotation chain)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await RefreshTokens.create({
      entidade_nif_nipc: entity.nif_nipc,
      token: newRefreshToken,
      tokenFamily: storedToken.tokenFamily, // Same family ID
      expiresAt,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
    });

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900, // 15 minutes in seconds
      refreshExpiresIn: 604800, // 7 days in seconds
      tokenType: "Bearer",
    });
  } catch (error) {
    next(genericError("Error refreshing token: " + error.message));
  }
};

/**
 * Logout - Revoke refresh token
 */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(missingFieldError(["refreshToken"]));
    }

    // Find and revoke the refresh token
    const result = await RefreshTokens.findOneAndUpdate(
      { token: refreshToken },
      { revoked: true, revokedAt: new Date() },
      { new: true },
    );

    if (!result) {
      return next(unauthorizedError("Refresh token not found"));
    }

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    next(genericError("Error during logout: " + error.message));
  }
};
