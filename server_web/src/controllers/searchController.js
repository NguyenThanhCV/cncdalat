const asyncHandler = require("../utils/asyncHandler");
const service = require("../services/searchService");

exports.search = asyncHandler(async (req, res) => {
  const result = await service.search(req.query.q || req.query.search || "");
  res.json({ success: true, data: result });
});
