export default (sequelize, DataTypes) => sequelize.define("offer", {
   id_oferta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
   },
   negocio_nif_nipc: {
    type: DataTypes.STRING(9),
    allowNull: false,
   },
   tipo_bem_servico: {
    type: DataTypes.STRING(10),
    allowNull: false,
   },
   descricao: {
    type: DataTypes.STRING(255),
    allowNull: false,
   },
   valor_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: "valor_total must be a valid decimal",
      },
      min: {
        args: [0.01],
        msg: "valor_total must be greater than 0",
      },
    },
   },
   desconto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: "desconto must be between 0 and 100",
      },
      max: {
        args: [100],
        msg: "desconto must be between 0 and 100",
      },
    },
   },
  },
  {
   tableName: "bens_e_servicos_negocio",
   timestamps: false,
  }
);