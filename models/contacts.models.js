export default (sequelize, DataTypes) => sequelize.define("Contact", {
   contacto: {
      type: DataTypes.STRING(45),
      primaryKey: true,
   },
   entidade_nif_nipc: {
      type: DataTypes.STRING(9),
      allowNull: false,
   },
   nome_contacto: {
      type: DataTypes.STRING(100),
      allowNull: false,
   },
   descricao: {
      type: DataTypes.STRING(255),
      allowNull: false,
   },
   },
   {
      tableName: "Contacto",
      timestamps: false,
   });