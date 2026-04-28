export default (sequelize, DataTypes) => sequelize.define("panel",{
  id_dispositivo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  token_api: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  geo_latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
  },
  geo_longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
  },
  raio_alcance: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  },
  {
    tableName: "painel",
    timestamps: false,
  }
);