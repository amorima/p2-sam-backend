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
        versao: String,
        device: {
            platform: String,
            user_agent: String,
            language: String,
            timezone: String,
            hardware_concurrency: Number,
            device_memory_gb: Number,
            screen_resolution: String,
            viewport: String,
            pixel_ratio: Number,
            online: Boolean,
            connection_type: String,
            connection_downlink_mbps: Number,
            connection_rtt_ms: Number,
            save_data: Boolean,
            battery_charging: Boolean,
            battery_level_pct: Number,
            jsheap_used_mb: Number,
            jsheap_total_mb: Number,
            uptime_seconds: Number,
            visibility: String,
        },
        timestamp: { type: Date, default: Date.now, index: true }
    },{
        timestamps: false
    }))

    return Locker;
}