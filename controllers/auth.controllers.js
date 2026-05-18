import { Entities } from "../models/db.config.js";
import { hashPassword, comparePassword, generateToken } from "../utils/auth.utils.js";
import { genericError, unauthorizedError, missingFieldError, validationError } from "../utils/error.utils.js";

export const login = async (req, res, next) => {
  try {
    const { email_login, password } = req.body;

    if (!email_login || !password) {
      return next(missingFieldError(['email_login', 'password']));
    }

    const entity = await Entities.findOne({ where: { email_login } });

    if (!entity) {
      return next(unauthorizedError('Invalid email or password'));
    }

    const isPasswordValid = await comparePassword(password, entity.password);

    if (!isPasswordValid) {
      return next(unauthorizedError('Invalid email or password'));
    }

    const token = generateToken({
      nif_nipc: entity.nif_nipc,
      email_login: entity.email_login,
      role: entity.role,
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      entity: {
        nif_nipc: entity.nif_nipc,
        email_login: entity.email_login,
        nome_entidade: entity.nome_entidade,
        role: entity.role,
      },
    });
  } catch (error) {
    next(genericError('Error during login: ' + error.message));
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const entity = await Entities.findByPk(req.user.nif_nipc);

    if (!entity) {
      return next(unauthorizedError('User not found'));
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
    next(genericError('Error fetching profile: ' + error.message));
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const nif_nipc = req.user.nif_nipc;

    if (!currentPassword || !newPassword) {
      return next(missingFieldError(['currentPassword', 'newPassword']));
    }

    if (newPassword.length < 8) {
      return next(validationError([{ newPassword: 'Password must be at least 8 characters long' }]));
    }

    const entity = await Entities.findByPk(nif_nipc);

    if (!entity) {
      return next(unauthorizedError('User not found'));
    }

    const isPasswordValid = await comparePassword(currentPassword, entity.password);

    if (!isPasswordValid) {
      return next(unauthorizedError('Current password is incorrect'));
    }

    const hashedPassword = await hashPassword(newPassword);
    await entity.update({ password: hashedPassword });

    res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(genericError('Error changing password: ' + error.message));
  }
};
