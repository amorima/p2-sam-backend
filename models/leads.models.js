export default (sequelize, DataTypes) => sequelize.define("lead",{
  id_lead: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  data: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  id_painel: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nome_cidadao: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  contacto_cidadao: {
    type: DataTypes.STRING(13),
    allowNull: false,
  },
  id_pedido: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  item_pedido: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM("ENTREGUE", "PENDENTE", "EXPIRADO"),
    allowNull: false,
  },
  pin_entrega: {
    type: DataTypes.STRING(16),
    allowNull: false,
  },
  id_locker: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  },
  {
    tableName: "leads",
    timestamps: false,
  });