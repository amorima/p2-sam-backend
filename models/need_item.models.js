export default (sequelize, DataTypes) => sequelize.define("need item", {
   id_pedido: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
   },
   tipo_bem_servico: {
    type: DataTypes.STRING(100),
    allowNull: false,
   },
   publico: {
    type: DataTypes.TINYINT,
    allowNull: false,
   },
  },
  {
   tableName: "pedido_bens_e_servicos",
   timestamps: false,
  }
);