export default (sequelize, DataTypes) => sequelize.define("Entity", {
  nif_nipc: {
    type: DataTypes.STRING(9),
    primaryKey: true,
    allowNull: false,
  },
  email_login: {
    type: DataTypes.STRING(45),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  nome_entidade: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  profile_pic: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  iban: {
    type: DataTypes.STRING(34),
    allowNull: true,
    unique: true,
  },
  },
  {
    tableName: "entidade",
    timestamps: false,
  })