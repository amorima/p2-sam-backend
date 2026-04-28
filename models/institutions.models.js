export default (sequelize, DataTypes) => sequelize.define("institution",{
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
  url_comprovativo_estatuto: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  },
  {
    tableName: "instituicao",
    timestamps: false,
  });
