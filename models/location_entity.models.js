export default (sequelize, DataTypes) => sequelize.define("location_entity",{
  entidade_nif_nipc: {
    type: DataTypes.STRING(45),
    primaryKey: true,
  },
  localidade_codigo_postal: {
    type: DataTypes.STRING(45),
    primaryKey: true,
  },
  },
  {
    tableName: "localidade_entidade",
    timestamps: false,
  })