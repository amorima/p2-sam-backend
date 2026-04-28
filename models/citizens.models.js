export default (sequelize, DataTypes) => sequelize.define("Citizen", {
   nome: {
      type: DataTypes.STRING(50),
      primaryKey: true,
   },
   contacto: {
      type: DataTypes.STRING(13),
      primaryKey: true,
      allowNull: false,
   },
   rgpd: {
      type: DataTypes.TINYINT,
      allowNull: false,
   },
   },
   {
      tableName: "Cidadao",
      timestamps: false,
   });