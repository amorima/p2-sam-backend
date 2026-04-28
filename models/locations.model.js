export default (sequelize, DataTypes) => sequelize.define("location",{
  codigo_postal: {
    type: DataTypes.STRING(8),
    primaryKey: true,
  },
  concelho: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  distrito: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  freguesia: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  pais: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  rua: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  n_porta: {
    type: DataTypes.STRING(5),
    allowNull: false,
  },
  },
  {
    tableName: "localidade",
    timestamps: false,
  },
);