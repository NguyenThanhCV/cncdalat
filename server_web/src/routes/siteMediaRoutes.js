const router = require("express").Router();
const SiteMedia = require("../models/SiteMedia");
const { protect } = require("../middlewares/authMiddleware");
const perm = require("../middlewares/permissionMiddleware");
const P = require("../constants/permissions");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

router.get("/", asyncHandler(async (_req, res) => {
  const data = await SiteMedia.find({ status: "active" }).sort({ key: 1 }).lean();
  res.json({ success: true, data });
}));
router.use("/manage", protect);
router.get("/manage", perm(P.SITEMEDIA_READ), asyncHandler(async (_req, res) => res.json({ success: true, data: await SiteMedia.find().sort({ key: 1 }) })));
router.post("/manage", perm(P.SITEMEDIA_CREATE), asyncHandler(async (req, res) => res.status(201).json({ success: true, data: await SiteMedia.create(req.body) })));
router.patch("/manage/:id", perm(P.SITEMEDIA_UPDATE), asyncHandler(async (req, res) => {
  const row = await SiteMedia.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!row) throw new AppError("Không tìm thấy tài nguyên media", 404);
  res.json({ success: true, data: row });
}));
router.delete("/manage/:id", perm(P.SITEMEDIA_DELETE), asyncHandler(async (req, res) => {
  const row = await SiteMedia.findByIdAndDelete(req.params.id);
  if (!row) throw new AppError("Không tìm thấy tài nguyên media", 404);
  res.json({ success: true, data: row });
}));
module.exports = router;
