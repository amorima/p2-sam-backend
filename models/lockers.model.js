export default (sequelize, DataTypes) => sequelize.define("locker",{
   id_locker: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
   },
   estado: {
    type: DataTypes.ENUM("DISPONIVEL", "INDISPONIVEL", "OCUPADO", "MANUTENCAO"),
    allowNull: false,
   },
   codigo_mestre: {
    type: DataTypes.STRING(45),
    allowNull: false,
   },
   geo_latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
   },
   geo_longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
   },
  },
  {
   tableName: "locker_inteligente",
   timestamps: false,
  }
);