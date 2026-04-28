import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIAL
    }
)

try{
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
} catch(e){
    console.error("Unable to connect to the database: ", e)
    process.exit(1);
}

// Models Import
import BusinessModel from "./business.models.js";
const Business = BusinessModel(sequelize, DataTypes);
import DonationsModel from "./donations.models.js";
const Donations = DonationsModel(sequelize, DataTypes);
import InstitutionsModel from "./institutions.models.js";
const Institutions = InstitutionsModel(sequelize, DataTypes);
import LeadsModel from "./leads.models.js";
const Leads = LeadsModel(sequelize, DataTypes);
import NeedsModel from "./needs.models.js";
const Needs = NeedsModel(sequelize, DataTypes);
import OffersModel from "./offers.models.js";
const Offers = OffersModel(sequelize, DataTypes);
import PatronsModel from "./patrons.models.js";
const Patrons = PatronsModel(sequelize, DataTypes);

// Sycronizing
try{
    await sequelize.sync({alter: true})
    console.log("All models were synced")
} catch(e) {
    console.error("Error synching the models")
    process.exit(1)
}

export { Business, Offers, Institutions, Needs, Patrons, Donations, Leads };