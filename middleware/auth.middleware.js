import { verifyToken, extractToken } from '../utils/auth.utils.js';
import { unauthorizedError, forbiddenError } from '../utils/error.utils.js';

export const verifyJWT = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return next(unauthorizedError('Authorization token is missing'));
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
    // Ensure verifyJWT was called first
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

/**
 * Middleware: Check if user is admin or the entity owner (self-entity)
 * Only admin or the entity with matching nif_nipc can perform the action
 */
export const adminOrSelf = (req, res, next) => {
  // Ensure verifyJWT was called first
  if (!req.user) {
    return next(unauthorizedError('User information not found in request'));
  }

  const userRole = req.user.role;
  const userNifNipc = req.user.nif_nipc;
  const targetNifNipc = req.params.nif_nipc;

  // Validate nif_nipc format (must be 9 digits)
  if (!/^\d{9}$/.test(targetNifNipc)) {
    return next(unauthorizedError('Invalid entity identifier format'));
  }

  // Allow if user is admin
  if (userRole === 'admin') {
    return next();
  }

  // Allow if user is the entity owner
  if (userNifNipc === targetNifNipc) {
    return next();
  }

  // Deny otherwise
  return next(forbiddenError('You do not have permission to modify this resource. Only admins or the resource owner can perform this action.'));
};