export default (sequelize, DataTypes) => sequelize.define("need", {
   id_pedido: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
   },
   nif_nipc: {
    type: DataTypes.STRING(9),
    allowNull: false,
   },
   estado: {
    type: DataTypes.ENUM("PENDENTE", "ACEITE", "REJEITADO"),
    allowNull: false,
   },
  },
  {
   tableName: "pedido",
   timestamps: false,
  }
);