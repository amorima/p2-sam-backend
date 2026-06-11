import { ApiTokens } from '../models/db.config.js';
import { generateApiToken, hashApiToken } from '../utils/auth.utils.js';
import { genericError, notFoundError } from '../utils/error.utils.js';

export const listTokens = async (req, res, next) => {
  try {
    const tokens = await ApiTokens
      .find({ nif_nipc: req.user.nif_nipc, revoked: false })
      .select('-token_hash')
      .sort({ createdAt: -1 })
    res.json(tokens)
  } catch (err) {
    console.error('[api-tokens] list error:', err?.message)
    next(genericError('Error fetching API tokens'))
  }
}

export const createToken = async (req, res, next) => {
  try {
    const rawLabel = (req.body ?? {}).label
    const label = typeof rawLabel === 'string' && rawLabel.trim() ? rawLabel.trim().slice(0, 100) : null

    // Revoke all existing tokens for this user — one active token per entity
    await ApiTokens.updateMany(
      { nif_nipc: req.user.nif_nipc, revoked: false },
      { $set: { revoked: true, revoked_at: new Date() } }
    )

    const plainToken = generateApiToken()
    const hash = hashApiToken(plainToken)
    const prefix = plainToken.slice(0, 12) // visible prefix stored for display

    const doc = await ApiTokens.create({
      nif_nipc: req.user.nif_nipc,
      role: req.user.role,
      token_hash: hash,
      token_prefix: prefix,
      label: label ?? 'Token de API'
    })

    // Return the full plain token ONCE — it is never stored and cannot be recovered
    res.status(201).json({
      _id: doc._id,
      token: plainToken,
      token_prefix: prefix,
      label: doc.label,
      createdAt: doc.createdAt
    })
  } catch (err) {
    console.error('[api-tokens] create error:', err?.message)
    next(genericError('Error creating API token'))
  }
}

export const revokeToken = async (req, res, next) => {
  try {
    const token = await ApiTokens.findOne({
      _id: req.params.id,
      nif_nipc: req.user.nif_nipc
    })
    if (!token) return next(notFoundError('Token', req.params.id))

    token.revoked = true
    token.revoked_at = new Date()
    await token.save()

    res.status(204).send()
  } catch (err) {
    // Malformed ObjectId in the route param
    if (err.name === 'CastError') return next(notFoundError('Token', req.params.id))
    console.error('[api-tokens] revoke error:', err?.message)
    next(genericError('Error revoking API token'))
  }
}
