import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

// Validate required environment variables
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

if (!JWT_EXPIRE) {
  throw new Error('JWT_EXPIRE environment variable is not set');
}

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

export const extractToken = (authHeader) => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
};

/**
 * Generate a refresh token (long-lived, for token rotation)
 * @param {Object} payload - Token payload
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRE });
};

/**
 * Verify a refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded token
 * @throws {Error} If token is invalid
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error(`Refresh token verification failed: ${error.message}`);
  }
};

/**
 * Generate a unique token family ID for detecting token reuse attacks
 * @returns {string} Token family ID
 */
export const generateTokenFamily = () => {
  return crypto.randomBytes(16).toString('hex');
};

// ── Permanent API tokens ──────────────────────────────────────────────────────

const API_TOKEN_HMAC_SECRET = process.env.API_TOKEN_SECRET || JWT_SECRET;

/**
 * Generate a permanent API token: `sam_` prefix + 64 hex chars.
 */
export const generateApiToken = () => {
  return `sam_${crypto.randomBytes(32).toString('hex')}`;
};

/**
 * Hash a permanent API token with HMAC-SHA256 for secure storage.
 * Deterministic — same token always yields the same hash.
 */
export const hashApiToken = (token) => {
  return crypto.createHmac('sha256', API_TOKEN_HMAC_SECRET).update(token).digest('hex');
};
