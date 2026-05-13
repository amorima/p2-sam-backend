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
     type: DataTypes.STRING(100),
     allowNull: false,
   },
   status: {
     type: DataTypes.ENUM('available','pending','completed'),
     allowNull: false,
     defaultValue: 'available',
   },
  },
  {
   tableName: "pedido_bens_e_servicos",
   timestamps: false,
  }
);