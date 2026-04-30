import { Business, Entities, Locations, Contacts } from "../models/db.config.js";
import { genericError, notFoundError, sequelizeValidationError } from "../utils/error.utils.js";

export const createBusiness = async(req, res, next) => {
    try{
        const newBusiness = await Business.create(req.body)
        const businessResponse = {
            ...newBusiness.toJSON(),
            _links: {
                allBusinesses: { href: "/business", method:"GET" },
                self: { herf:`/business/${newBusiness.nif_nipc}`, method: "GET"},
                update: { href: `/business/${newBusiness.nif_nipc}`, method: "PATCH"},
                delete: { href: `/business/${newBusiness.nif_nipc}`, method: "DELETE"},
                postOffer: { href: `/business/${newBusiness.nif_nipc}/offers`, method: "POST"}
            }
        }

        res.status(201).json(businessResponse);
    } catch(e){
        if(e.name === "SequelizeValidationError") next(sequelizeValidationError(e.errors));
        else next(genericError("Error Creating Business"));
    }
};

export const updateBusiness = async (req, res, next) => {
  const { nif_nipc } = req.params;
  try {
    const business = await Business.findByPk(nif_nipc);
    if (!business) return next(notFoundError("Business", nif_nipc));

    const updatedBusiness = await business.update(req.body);

    const response = {
      ...updatedBusiness.toJSON(),
      _links: {
        self: { href: `/business/${updatedBusiness.nif_nipc}`, method: "GET" },
        update: { href: `/business/${updatedBusiness.nif_nipc}`, method: "PATCH" },
        delete: { href: `/business/${updatedBusiness.nif_nipc}`, method: "DELETE" },
        postOffer: { href: `/business/${updatedBusiness.nif_nipc}/offers`, method: "POST" },
        all: { href: "/business", method: "GET" }
      }
    }

    res.json(response);
  } catch (e) {
    if (e.name === "SequelizeValidationError") next(sequelizeValidationError(e.errors));
    else next(genericError("Error updating business"));
  }
};

export const getBusiness = async(req, res, next) => {
    const { nif_nipc } = req.params;
    try{
        const business = await Business.findByPk(nif_nipc);

        const response ={
            ...business.toJSON(),
            _links: {
                self: { herf:`/business/${b.nif_nipc}`, method: "GET"},
                update: { href: `/business/${b.nif_nipc}`, method: "PATCH"},
                delete: { href: `/business/${b.nif_nipc}`, method: "DELETE"},
                postOffer: { href: `/business/${b.nif_nipc}/offers`, method: "POST"},
                all: { href: '/business', method: "GET"}
            }
        }

        res.json(response);
    } catch(e){
        next(genericError("Erro fetching business"));
    }
}

export const getAllBusiness = async(req, res, next) => {
    try{
        const businesses = await Business.findAll();

        const bList = businesses.map(b => ({
            ...b.toJSON(),
            _links: {
                self: { herf:`/business/${b.nif_nipc}`, method: "GET"},
                update: { href: `/business/${b.nif_nipc}`, method: "PATCH"},
                delete: { href: `/business/${b.nif_nipc}`, method: "DELETE"},
                postOffer: { href: `/business/${b.nif_nipc}/offers`, method: "POST"}
            }
        }))

        const response = {
            data: bList,
            _links: {
                create: { href: "/business", method: "POST"}
            }
        }
        res.json(response);
    } catch(e){
        next(genericError("Erro fetching businesses"));
    }
}

export const deleteBusiness = async(req, res, next) => {
    const { nif_nipc } = req.params;
    try{
        const business = await Business.findByPk(nif_nipc);
        if(!business) return next(notFoundError("Business", nif_nipc))

        await business.destroy();

        res.status(204).send()
    } catch(e){
        next(genericError("Error deleting business"))
    }
}