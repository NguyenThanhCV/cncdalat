const mongoose = require("mongoose");

module.exports = mongoose.model("SiteMedia", new mongoose.Schema({
  key: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  label: { type: String, required: true, trim: true, maxlength: 120 },
  mediaUrl: { type: String, default: "", trim: true },
  mediaType: { type: String, enum: ["image", "video"], default: "image" },
  altText: { type: String, default: "", trim: true, maxlength: 180 },
  status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
}, { timestamps: true }));
