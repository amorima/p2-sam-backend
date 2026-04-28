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
   },
   desconto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
   },
  },
  {
   tableName: "bens_e_servicos_negocio",
   timestamps: false,
  }
);