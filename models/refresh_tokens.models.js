export default (mongoose) => {
    const RefreshToken = mongoose.model('RefreshToken', new mongoose.Schema({
        entidade_nif_nipc: String,
        token: String,
        tokenFamily: String,
        expiresAt: Date,
        revoked: {
            type: Boolean,
            default: false
        },
        revokedAt: Date,
        ipAddress: String,
        userAgent: String
    }, {
        timestamps: true
    }))

    return RefreshToken;
}
