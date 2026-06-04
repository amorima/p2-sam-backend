export default (sequelize, DataTypes) => sequelize.define("need item", {
   id_item: {
     type: DataTypes.INTEGER,
     primaryKey: true,
     autoIncrement: true,
     allowNull: false,
   },
   id_pedido: {
     type: DataTypes.INTEGER,
     allowNull: false,
   },
   tipo_bem_servico: {
     type: DataTypes.STRING(50),
     allowNull: false,
   },
   publico: {
     type: DataTypes.TINYINT,
     allowNull: true,
   },
   match_negocio_nif: {
     type: DataTypes.STRING(9),
     allowNull: true,
   },
   match_negocio_nome: {
     type: DataTypes.STRING(150),
     allowNull: true,
   },
   match_negocio_estado: {
     type: DataTypes.ENUM('PENDENTE', 'ACEITE', 'RECUSADO', 'CONCLUIDO'),
     allowNull: true,
   },
   match_negocio_motivo: {
     type: DataTypes.STRING(255),
     allowNull: true,
   },
  },
  {
   tableName: "pedido_bens_e_servicos",
   timestamps: false,
  }
);
