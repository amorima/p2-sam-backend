export default (sequelize, DataTypes) => sequelize.define("Contact", {
   contacto: {
      type: DataTypes.STRING(45),
      primaryKey: true,
      validate: {
         is: {
            // Phone number (9-15 digits, optional +) or email address
            args: /^(?:\+?\d{9,15}|[^\s@]+@[^\s@]+\.[^\s@]+)$/,
            msg: "contacto must be a phone number or a valid email address",
         },
      },
   },
   entidade_nif_nipc: {
      type: DataTypes.STRING(9),
      allowNull: false,
      validate: {
         is: {
            args: /^\d{9}$/,
            msg: "entidade_nif_nipc must be exactly 9 digits",
         },
      },
   },
   nome_contacto: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
         notEmpty: {
            msg: "nome_contacto cannot be empty",
         },
      },
   },
   descricao: {
      type: DataTypes.STRING(255),
      allowNull: false,
   },
   },
   {
      tableName: "contacto",
      timestamps: false,
   });