import { Vouchers } from "../models/db.config.js";
import { genericError, notFoundError } from "../utils/error.utils.js";

export const createVoucher = async (req, res, next) => {
  try {
    const voucher = await Vouchers.create(req.body);
    res.status(201).json(voucher);
  } catch (e) {
    next(genericError("Error creating voucher"));
  }
};

export const getVoucher = async (req, res, next) => {
  const { id } = req.params;

  try {
    const voucher = await Vouchers.findById(id);
    if (!voucher) return next(notFoundError("Voucher", id));
    res.json(voucher);
  } catch (e) {
    next(genericError("Error fetching voucher"));
  }
};

export const getAllVouchers = async (req, res, next) => {
  try {
    const vouchers = await Vouchers.find();
    res.json(vouchers);
  } catch (e) {
    next(genericError("Error fetching vouchers"));
  }
};

export const updateVoucher = async (req, res, next) => {
  const { id } = req.params;

  try {
    const voucher = await Vouchers.findByIdAndUpdate(id, req.body, { new: true });
    if (!voucher) return next(notFoundError("Voucher", id));
    res.json(voucher);
  } catch (e) {
    next(genericError("Error updating voucher"));
  }
};