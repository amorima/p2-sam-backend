export default (mongoose) => {
    const Interaction = mongoose.model('Interaction', new mongoose.Schema({
        sessao: Number,
        id_painel: Number,
        inicio_sessao: Date,
        duracao_inteacao: Number,
        fluxo_navegacao: [String],
        concluiu_doacao: Boolean,
        passo_abandono: String,
        idioma: String
    },{
        timestamps: false
    }))

    return Interaction;
}