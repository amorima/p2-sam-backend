export default (sequelize, DataTypes) => sequelize.define("Entity", {
  nif_nipc: {
    type: DataTypes.STRING(9),
    primaryKey: true,
    allowNull: false,
    validate: {
      is: {
        args: /^\d{9}$/,
        msg: "nif_nipc must be exactly 9 digits",
      },
    },
  },
  email_login: {
    type: DataTypes.STRING(45),
    allowNull: false,
    validate: {
      isEmail: {
        msg: "email_login must be a valid email address",
      },
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  nome_entidade: {
    type: DataTypes.STRING(45),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "nome_entidade cannot be empty",
      },
    },
  },
  iban: {
    type: DataTypes.STRING(34),
    allowNull: true,
    validate: {
      is: {
        args: /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/,
        msg: "iban must be a valid IBAN (e.g. PT50 followed by 21 digits)",
      },
    },
  },
  profile_pic: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('patron', 'business', 'institution', 'admin'),
    allowNull: false,
    defaultValue: 'patron',
  },
  blocked: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
  },
  },
  {
    tableName: "entidade",
    timestamps: false,
  })
