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

export const authenticateAndAuthorize = (requiredRoles) => {
  return [verifyJWT, requireRoles(requiredRoles)];
};
