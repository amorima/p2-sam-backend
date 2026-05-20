import { Sequelize, DataTypes } from "sequelize";
import mongoose from 'mongoose';

const mongoUri = process.env.MONGO_URI;
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIAL
    }
)

// Testing Connection
try{
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
} catch(e){
    console.error("Unable to connect to the database: ", e)
    process.exit(1);
}
try {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB successfully.");
} catch (error) {
  console.error("Unable to connect to MongoDB:", error);
  process.exit(1);
}

// Models Import
import BusinessModel from "./business.models.js";
const Business = BusinessModel(sequelize, DataTypes);
import CitizensModel from "./citizens.models.js";
const Citizens = CitizensModel(sequelize, DataTypes);
import ContactsModel from "./contacts.models.js";
const Contacts = ContactsModel(sequelize, DataTypes);
import DonationsModel from "./donations.models.js";
const Donations = DonationsModel(sequelize, DataTypes);
import EntitiesModel from "./entities.models.js";
const Entities = EntitiesModel(sequelize, DataTypes);
import GoodsServicesModel from "./goods_services.models.js";
const GoodsServices = GoodsServicesModel(sequelize, DataTypes);
import InstitutionsModel from "./institutions.models.js";
const Institutions = InstitutionsModel(sequelize, DataTypes);
import LeadsModel from "./leads.models.js";
const Leads = LeadsModel(sequelize, DataTypes);
import LocationEntityModel from "./location_entity.models.js";
const LocationEntity = LocationEntityModel(sequelize, DataTypes);
import LocationsModel from "./locations.model.js";
const Locations = LocationsModel(sequelize, DataTypes);
import LockersModel from "./lockers.model.js";
const Lockers = LockersModel(sequelize, DataTypes);
import NeedItemModel from "./need_item.models.js";
const NeedItem = NeedItemModel(sequelize, DataTypes);
import NeedsModel from "./needs.models.js";
const Needs = NeedsModel(sequelize, DataTypes);
import OffersModel from "./offers.models.js";
const Offers = OffersModel(sequelize, DataTypes);
import PanelsModel from "./panels.models.js";
const Panels = PanelsModel(sequelize, DataTypes);
import PatronsModel from "./patrons.models.js";
const Patrons = PatronsModel(sequelize, DataTypes);

import VouchersModel from "./vouchers.models.js";
const Vouchers = VouchersModel(mongoose);
import LockersTelemetryModel from "./locker_telemetry.models.js";
const LockersTelemetry = LockersTelemetryModel(mongoose);
import FinancialLogsModel from "./financial_logs.models.js";
const FinancialLogs = FinancialLogsModel(mongoose);
import InteractionLogsModel from "./interaction_logs.models.js";
const InteractionLogs = InteractionLogsModel(mongoose);
import NotificationsModels from "./notifications.models.js";
const Notifications = NotificationsModels(mongoose);
import RefreshTokensModel from "./refresh_tokens.models.js";
const RefreshTokens = RefreshTokensModel(mongoose);

// Define Relations
Entities.belongsToMany(Locations, {
  through: LocationEntity,
  foreignKey: "entidade_nif_nipc",
  otherKey: "localidade_codigo_postal",
  as: "locations"
});
Locations.belongsToMany(Entities, {
  through: LocationEntity,
  foreignKey: "localidade_codigo_postal",
  otherKey: "entidade_nif_nipc",
  as: "entities"
});

Contacts.belongsTo(Entities, {
  foreignKey: "entidade_nif_nipc",
  targetKey: "nif_nipc",
});
Entities.hasMany(Contacts, {
  foreignKey: "entidade_nif_nipc",
  sourceKey: "nif_nipc",
});

Patrons.belongsTo(Entities, {
  foreignKey: "nif_nipc",
  targetKey: "nif_nipc",
});
Entities.hasOne(Patrons, {
  foreignKey: "nif_nipc",
  sourceKey: "nif_nipc",
});

Institutions.belongsTo(Entities, {
  foreignKey: "nif_nipc",
  targetKey: "nif_nipc",
});
Entities.hasOne(Institutions, {
  foreignKey: "nif_nipc",
  sourceKey: "nif_nipc",
});

Business.belongsTo(Entities, {
  foreignKey: "nif_nipc",
  targetKey: "nif_nipc",
});
Entities.hasOne(Business, {
  foreignKey: "nif_nipc",
  sourceKey: "nif_nipc",
});

Donations.belongsTo(Patrons, {
  foreignKey: "mecena_nif_nipc",
  targetKey: "nif_nipc",
});
Patrons.hasMany(Donations, {
  foreignKey: "mecena_nif_nipc",
  sourceKey: "nif_nipc",
});

Needs.belongsTo(Institutions, {
  foreignKey: "nif_nipc",
  targetKey: "nif_nipc",
});
Institutions.hasMany(Needs, {
  foreignKey: "nif_nipc",
  sourceKey: "nif_nipc",
});

NeedItem.belongsTo(Needs, {
  foreignKey: "id_pedido",
  targetKey: "id_pedido",
});
Needs.hasMany(NeedItem, {
  foreignKey: "id_pedido",
  sourceKey: "id_pedido",
});

NeedItem.belongsTo(GoodsServices, {
  foreignKey: "tipo_bem_servico",
  targetKey: "tipo_bem_servico",
});
GoodsServices.hasMany(NeedItem, {
  foreignKey: "tipo_bem_servico",
  sourceKey: "tipo_bem_servico",
});

Leads.belongsTo(NeedItem, {
  foreignKey: "id_item",
  targetKey: "id_item",
});
NeedItem.hasMany(Leads, {
  foreignKey: "id_item",
  sourceKey: "id_item",
});

Leads.belongsTo(Citizens, {
  foreignKey: "contacto_cidadao",
  targetKey: "contacto",
});
Citizens.hasMany(Leads, {
  foreignKey: "contacto_cidadao",
  sourceKey: "contacto",
});

Offers.belongsTo(Business, {
  foreignKey: "negocio_nif_nipc",
  targetKey: "nif_nipc",
});
Business.hasMany(Offers, {
  foreignKey: "negocio_nif_nipc",
  sourceKey: "nif_nipc",
});

Offers.belongsTo(GoodsServices, {
  foreignKey: "tipo_bem_servico",
  targetKey: "tipo_bem_servico",
});
GoodsServices.hasMany(Offers, {
  foreignKey: "tipo_bem_servico",
  sourceKey: "tipo_bem_servico",
});

Leads.belongsTo(Panels, {
  foreignKey: "id_painel",
  targetKey: "id_dispositivo",
});
Panels.hasMany(Leads, {
  foreignKey: "id_painel",
  sourceKey: "id_dispositivo",
});

Leads.belongsTo(Lockers, {
  foreignKey: "id_locker",
  targetKey: "id_locker",
});
Lockers.hasMany(Leads, {
  foreignKey: "id_locker",
  sourceKey: "id_locker",
});

// Sycronizing
try{
    await sequelize.sync({force: true})
    console.log("All models were synced")
} catch(e) {
    console.error("Error synching the models", e)
    process.exit(1)
}

export { Business, Citizens, Contacts, Donations, Entities, GoodsServices, Institutions, Leads, LocationEntity, Locations, Lockers, NeedItem, Needs, Offers, Panels, Patrons, Vouchers, LockersTelemetry, FinancialLogs, InteractionLogs, Notifications, RefreshTokens };