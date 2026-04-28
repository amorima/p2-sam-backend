export default (sequelize, DataTypes) => sequelize.define("business", {
   nif_nipc: {
      type: DataTypes.STRING(9),
      primaryKey: true,
   },
   geo_latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
   },
   geo_longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
   },
   url_certidao_permanente: {
      type: DataTypes.TEXT,
      allowNull: false,
   },
   inicio_atividade: {
      type: DataTypes.DATE,
      allowNull: false,
   },
   },
   {
      tableName: "negocio",
      timestamps: false,
   });
