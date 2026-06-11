export default (sequelize, DataTypes) => sequelize.define("Citizen", {
   nome: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      validate: {
         notEmpty: {
            msg: "nome cannot be empty",
         },
      },
   },
   contacto: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
         is: {
            // Phone number (9-15 digits, optional +) or email address
            args: /^(?:\+?\d{9,15}|[^\s@]+@[^\s@]+\.[^\s@]+)$/,
            msg: "contacto must be a phone number or a valid email address",
         },
      },
   },
   rgpd: {
      type: DataTypes.TINYINT,
      allowNull: false,
   },
   blocked: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
   },
   role: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "citizen",
   },
   reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null
   }
   },
   {
      tableName: "cidadao",
      timestamps: false,
   });
