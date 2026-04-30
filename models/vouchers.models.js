export default (mongoose) => {
    const Voucher = mongoose.model('Voucher', new mongoose.Schema({
        montante: Number,
        data_emissao: Date,
        estado: String,
        validade: Date,
        entidades_disponiveis: [Number],
        data_uso: Date,
    },{
        timestamps: false
    }))

    return Voucher;
}