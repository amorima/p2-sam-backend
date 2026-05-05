export default (mongoose) => {
    const Financial = mongoose.model('Financial', new mongoose.Schema({
        id_doacao: Number,
        mecena_nif_nipc: String,
        id_transacao: Number,
        metodo: String,
        data: Date,
        getway: String,
        telemovel_hash: String,
        codigo_aprovacao: String,
        id_pedido_sibs: String,
        ip_dispositivo: String,
        tentativa: Number,
        motivo_erro: String
    },{
        timestamps: false
    }))

    return Financial;
}