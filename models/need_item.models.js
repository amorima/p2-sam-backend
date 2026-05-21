export default (sequelize, DataTypes) => sequelize.define("need item", {
  id_item: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
}, {
  tableName: "pedido_bens_e_servicos",
  timestamps: false,
  indexes: [
    { unique: true, fields: ['id_pedido', 'tipo_bem_servico'], name: 'uq_pbs_pedido_item' }
  ]
});
