const s = require("../services/couponService"),
  a = require("../utils/asyncHandler");
const Coupon = require("../models/Coupon");
exports.available = a(async (_req, res) => {
  const now = new Date();
  const data = await Coupon.find({ status: "active", $and: [
    { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
    { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] },
    { $or: [{ usageLimit: { $exists: false } }, { usageLimit: null }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }] },
  ] }).select("code name nameEn type value minOrderValue maxDiscount startDate endDate usageLimit usedCount").sort({ createdAt: -1 }).lean();
  res.json({ success: true, data });
});
exports.list = a(async (req, res) =>
  res.json({ success: true, ...(await s.list({}, req.query)) }),
);
exports.get = a(async (req, res) =>
  res.json({ success: true, data: await s.get(req.params.id) }),
);
exports.byCode = a(async (req, res) =>
  res.json({ success: true, data: await s.byCode(req.params.code) }),
);
exports.create = a(async (req, res) =>
  res.status(201).json({ success: true, data: await s.create(req.body) }),
);
exports.update = a(async (req, res) =>
  res.json({ success: true, data: await s.update(req.params.id, req.body) }),
);
exports.remove = a(async (req, res) =>
  res.json({ success: true, data: await s.remove(req.params.id) }),
);
