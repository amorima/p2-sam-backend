export default (mongoose) => {
    const Notification = mongoose.model('Notification', new mongoose.Schema({
        lead_sql_id: Number,
        tipo: String,
        titulo: String,
        corpo: String,
        destinatario: String,
        data_envio: Date,
        estado_envio: String,
        tentativas: Number,
        motivo_erro: String,
        lida: { type: Boolean, default: false },
        payload: { type: mongoose.Schema.Types.Mixed, default: {} }
    },{
        timestamps: false
    }))

    return Notification;
}