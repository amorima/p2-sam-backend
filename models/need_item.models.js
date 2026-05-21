export default (sequelize, DataTypes) => sequelize.define("need item", {
   id_pedido: {
     type: DataTypes.INTEGER,
     primaryKey: true,
     allowNull: false,
   },
   tipo_bem_servico: {
     type: DataTypes.STRING(50),
     primaryKey: true,
     allowNull: false,
   },
   publico: {
     type: DataTypes.TINYINT,
     allowNull: true,
   },
  },
  {
   tableName: "pedido_bens_e_servicos",
   timestamps: false,
  }
);
