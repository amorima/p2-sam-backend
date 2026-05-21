export default (sequelize, DataTypes) => sequelize.define("Citizen", {
   nome: {
      type: DataTypes.STRING(50),
      primaryKey: true,
   },
   contacto: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
   },
   rgpd: {
      type: DataTypes.TINYINT,
      allowNull: false,
   },
   blocked: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
   },
   role: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "citizen",
   },
   reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
   },
   },
   {
      tableName: "cidadao",
      timestamps: false,
   });
