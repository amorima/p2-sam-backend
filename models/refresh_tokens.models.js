import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    entidade_nif_nipc: {
      type: String,
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tokenFamily: {
      type: String,
      description: 'Unique family ID to detect token reuse attacks',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to auto-delete expired tokens after 7 days
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default (mongoose) => {
  return mongoose.model('RefreshToken', refreshTokenSchema);
};
