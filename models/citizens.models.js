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
   suspense: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
   },
   reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null
   }
   },
   {
      tableName: "Cidadao",
      timestamps: false,
   });