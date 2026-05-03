export default (mongoose) => {
    const Locker = mongoose.model('Locker', new mongoose.Schema({
        evento: String,
        locker_id: Number,
        tipo: String,
        geo_latitude: Number,
        geo_longitude: Number,
        bateria_estado: Number,
        cpu_temperatura: Number,
        dnb_sinal: Number,
        aviso: String,
        status: {
            sensor_porta: String,
            numpad: String,
        },
        versao:String
    },{
        timestamps: false
    }))

    return Locker;
}