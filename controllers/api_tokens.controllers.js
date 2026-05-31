import { ApiTokens } from '../models/db.config.js';
import { generateApiToken, hashApiToken } from '../utils/auth.utils.js';

export const listTokens = async (req, res, next) => {
  try {
    const tokens = await ApiTokens
      .find({ nif_nipc: req.user.nif_nipc, revoked: false })
      .select('-token_hash')
      .sort({ createdAt: -1 })
    res.json(tokens)
  } catch (err) {
    next(err)
  }
}

export const createToken = async (req, res, next) => {
  try {
    const { label } = req.body

    // Revoke all existing tokens for this user — one active token per entity
    await ApiTokens.updateMany(
      { nif_nipc: req.user.nif_nipc, revoked: false },
      { revoked: true, revoked_at: new Date() }
    )

    const plainToken = generateApiToken()
    const hash = hashApiToken(plainToken)
    const prefix = plainToken.slice(0, 12) // "sam_" + 8 chars visible

    const doc = await ApiTokens.create({
      nif_nipc: req.user.nif_nipc,
      role: req.user.role,
      token_hash: hash,
      token_prefix: prefix,
      label: label || 'Token de API'
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
    next(err)
  }
}

export const revokeToken = async (req, res, next) => {
  try {
    const token = await ApiTokens.findOne({
      _id: req.params.id,
      nif_nipc: req.user.nif_nipc
    })
    if (!token) return res.status(404).json({ description: 'Token não encontrado' })

    token.revoked = true
    token.revoked_at = new Date()
    await token.save()

    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
