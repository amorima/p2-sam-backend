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
  iban: {
    type: DataTypes.STRING(23),
    allowNull: true,
    unique: true,
  },
  profile_pic: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM("patron", "business", "institution", "admin"),
    allowNull: false,
  },
  },
  {
    tableName: "entidade",
    timestamps: false,
  })
