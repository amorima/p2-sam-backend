export default (sequelize, DataTypes) => sequelize.define("lead",{
  id_lead: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  data: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
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
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  id_pedido: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_item: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  item_pedido: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  estado: {
    type: DataTypes.ENUM("ENTREGUE", "PENDENTE", "EXPIRADO"),
    allowNull: false,
    defaultValue: "PENDENTE",
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
