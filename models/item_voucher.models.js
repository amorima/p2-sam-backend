export default (mongoose) => {
    const ItemVoucher = mongoose.model('ItemVoucher', new mongoose.Schema({
        id_item: { type: Number, required: true },
        id_pedido: { type: Number, required: true },
        voucher_ref: { type: String, required: true },
        data_emissao: { type: Date, default: Date.now },
    }, {
        timestamps: false
    }))

    return ItemVoucher;
}
