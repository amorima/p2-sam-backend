import { verifyToken, extractToken, hashApiToken } from '../utils/auth.utils.js';
import { unauthorizedError, forbiddenError } from '../utils/error.utils.js';

// Trusted Nuxt-proxy bypass: accepts X-Internal-Key + X-User-Nif/Role headers
export const verifyInternalOrJWT = (req, res, next) => {
  const internalKey = req.headers['x-internal-key'];
  const configKey = process.env.INTERNAL_API_KEY;
  if (configKey && internalKey === configKey) {
    req.user = {
      nif_nipc: req.headers['x-user-nif'] || '',
      role: req.headers['x-user-role'] || 'patron'
    };
    return next();
  }
  verifyJWT(req, res, next);
};

export const verifyJWT = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    if (!token) return next(unauthorizedError('Authorization token is missing'));

    // Dynamic import avoids circular ESM init-order issues with db.config.js
    if (token.startsWith('sam_')) {
      const { ApiTokens } = await import('../models/db.config.js');
      const hash = hashApiToken(token);
      const apiToken = await ApiTokens.findOne({ token_hash: hash, revoked: false });
      if (!apiToken) return next(unauthorizedError('Invalid or revoked API token'));
      ApiTokens.updateOne({ _id: apiToken._id }, { $set: { last_used_at: new Date() } }).catch(() => {});
      req.user = { nif_nipc: apiToken.nif_nipc, role: apiToken.role };
      return next();
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return next(unauthorizedError(error.message));
  }
};

export const requireRoles = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(unauthorizedError('User information not found in request'));
    }

    const userRole = req.user.role;
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (!rolesArray.includes(userRole)) {
      return next(forbiddenError(`User role '${userRole}' does not have permission to access this resource. Required roles: ${rolesArray.join(', ')}`));
    }

    next();
  };
};

// Grants access to admins or to the entity that owns the resource (self-management).
export const adminOrSelf = (req, res, next) => {
  if (!req.user) {
    return next(unauthorizedError('User information not found in request'));
  }

  const { role, nif_nipc } = req.user;
  const targetNifNipc = req.params.nif_nipc;

  if (!/^\d{9}$/.test(targetNifNipc)) {
    return next(unauthorizedError('Invalid entity identifier format'));
  }

  if (role === 'admin' || nif_nipc === targetNifNipc) {
    return next();
  }

  return next(forbiddenError('You do not have permission to modify this resource. Only admins or the resource owner can perform this action.'));
};