export default (mongoose) => {
    const Notification = mongoose.model('Notification', new mongoose.Schema({
        lead_sql_id: Number,
        tipo: String,
        destinatario: String,
        data_envio: Date,
        estado_envio: String,
        tentativas: Number,
        motivo_erro: String
    },{
        timestamps: false
    }))

    return Notification;
}