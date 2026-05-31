export default (mongoose) => {
  const ApiToken = mongoose.model('ApiToken', new mongoose.Schema({
    nif_nipc: { type: String, required: true, index: true },
    role: { type: String, required: true },
    token_hash: { type: String, required: true, unique: true, index: true },
    token_prefix: { type: String, required: true },
    label: { type: String, default: 'Token de API' },
    last_used_at: { type: Date, default: null },
    revoked: { type: Boolean, default: false, index: true },
    revoked_at: { type: Date, default: null }
  }, { timestamps: true }))
  return ApiToken
}
