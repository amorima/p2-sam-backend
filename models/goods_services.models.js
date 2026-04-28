export default (sequelize, DataTypes) => sequelize.define("Goods and Services",{
   tipo_bem_servico: {
      type: DataTypes.STRING(50),
      primaryKey: true,
   },
   tipo_bem: {
      type: DataTypes.ENUM("BEM", "SERVICO"),
      allowNull: false,
   },
   },
   {
      tableName: "bens_e_servico",
      timestamps: false,
   })