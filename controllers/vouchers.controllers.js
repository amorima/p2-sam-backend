import { Vouchers } from "../models/db.config.js";
import { genericError, notFoundError } from "../utils/error.utils.js";
import { parsePagination, buildPageLinks } from "../utils/paginate.utils.js";

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
    const voucher = await Vouchers.findById(id).lean();
    if (!voucher) return next(notFoundError("Voucher", id));
    res.json(voucher);
  } catch (e) {
    next(genericError("Error fetching voucher"));
  }
};

export const getAllVouchers = async (req, res, next) => {
  const { limit, offset } = parsePagination(req.query);
  try {
    const [items, total] = await Promise.all([
      Vouchers.find().skip(offset).limit(limit).lean(),
      Vouchers.countDocuments(),
    ]);
    res.json({ items, total, limit, offset, links: buildPageLinks('/vouchers', limit, offset, total) });
  } catch (e) {
    next(genericError("Error fetching vouchers"));
  }
};

export const updateVoucher = async (req, res, next) => {
  const { id } = req.params;

  try {
    const voucher = await Vouchers.findByIdAndUpdate(id, req.body, { new: true, lean: true });
    if (!voucher) return next(notFoundError("Voucher", id));
    res.json(voucher);
  } catch (e) {
    next(genericError("Error updating voucher"));
  }
};