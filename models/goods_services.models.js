export default (sequelize, DataTypes) => sequelize.define("Goods and Services",{
   tipo_bem_servico: {
      type: DataTypes.STRING(50),
      primaryKey: true,
   },
   tipo_bem: {
      type: DataTypes.ENUM("bem", "servico"),
      allowNull: false,
   },
   },
   {
      tableName: "bens_e_servicos",
      timestamps: false,
   })
