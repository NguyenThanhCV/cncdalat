const mongoose = require("mongoose");

module.exports = mongoose.model("Promotion", new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  nameEn: { type: String, trim: true, default: "" },
  scope: { type: String, enum: ["product", "category", "brand"], required: true },
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  brandIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
  type: { type: String, enum: ["percent", "fixed"], required: true },
  value: { type: Number, required: true, min: 0 },
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ["active", "inactive"], default: "active" },
}, { timestamps: true }));
