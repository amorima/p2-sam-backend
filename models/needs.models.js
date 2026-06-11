export default (sequelize, DataTypes) => sequelize.define("need", {
   id_pedido: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
   },
   nif_nipc: {
    type: DataTypes.STRING(9),
    allowNull: false,
    validate: {
      is: {
        args: /^\d{9}$/,
        msg: "nif_nipc must be exactly 9 digits",
      },
    },
   },
   estado: {
    type: DataTypes.ENUM("PENDENTE", "ACEITE", "REJEITADO"),
    allowNull: false,
    defaultValue: "PENDENTE",
   },
   urgente: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
   },
   data: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
   },
  },
  {
   tableName: "pedido",
   timestamps: false,
  }
);
