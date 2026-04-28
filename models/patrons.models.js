export default (sequelize, DataTypes) => sequelize.define("patron", {
   nif_nipc: {
    type: DataTypes.STRING(9),
    primaryKey: true,
    allowNull: false,
   },
   },
   {
      tableName: "mecena",
      timestamps: false,
   }
);