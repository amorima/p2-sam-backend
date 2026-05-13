export default (sequelize, DataTypes) => sequelize.define("donation", {
   id_doacao: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
   },
   mecena_nif_nipc: {
      type: DataTypes.STRING(9),
      allowNull: false,
   },
   data: {
      type: DataTypes.DATE,
      allowNull: false,
   },
   valor_transacao: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
         min: {
            args: [0],
            msg: "valor_transacao must be greater than or equal to 0",
         },
      },
   },
   tipo_donativo: {
      type: DataTypes.ENUM("NUMERARIO","REFERENCIA","CHEQUE","TRANSFERENCIA"),
      allowNull: false,
   },
   anonimo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
   },
   url_comprovativo: {
      type: DataTypes.TEXT,
      allowNull: false,
   },
   estado: {
      type: DataTypes.ENUM("ACEITE", "REJEITADO", "PENDENTE"),
      allowNull: false,
      defaultValue: "PENDENTE",
   },
   },
   {
      tableName: "doacao",
      timestamps: false,
   });
