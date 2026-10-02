const Promotion = require("../models/Promotion");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const nowFilter = (now) => ({ status: "active", $and: [
  { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
  { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] },
] });
const clean = (body) => {
  const data = { ...body };
  for (const key of ["productIds", "categoryIds", "brandIds"]) data[key] = (data[key] || []).map(String);
  data.value = Number(data.value);
  if (!data.id) data.id = `promo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return data;
};

exports.publicList = asyncHandler(async (_req, res) => {
  const data = await Promotion.find(nowFilter(new Date())).sort({ updatedAt: -1 }).lean();
  res.json({ success: true, data });
});
exports.list = asyncHandler(async (_req, res) => res.json({ success: true, data: await Promotion.find().sort({ updatedAt: -1 }) }));
exports.create = asyncHandler(async (req, res) => res.status(201).json({ success: true, data: await Promotion.create(clean(req.body)) }));
exports.update = asyncHandler(async (req, res) => {
  const data = await Promotion.findOneAndUpdate({ id: req.params.id }, clean({ ...req.body, id: req.params.id }), { new: true, runValidators: true });
  if (!data) throw new AppError("Không tìm thấy chương trình", 404);
  res.json({ success: true, data });
});
exports.remove = asyncHandler(async (req, res) => {
  const data = await Promotion.findOneAndDelete({ id: req.params.id });
  if (!data) throw new AppError("Không tìm thấy chương trình", 404);
  res.json({ success: true, data });
});
