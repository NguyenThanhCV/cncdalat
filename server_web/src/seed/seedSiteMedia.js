require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const SiteMedia = require("../models/SiteMedia");

const defaults = [
  { key: "storefront-hero", label: "Video nền hero trang chủ", mediaUrl: "", mediaType: "video", altText: "Video nền trang chủ" },
  { key: "store-logo", label: "Logo cửa hàng", mediaUrl: "", mediaType: "image", altText: "Nhà kính công nghệ cao Đà Lạt" },
  { key: "news-hero", label: "Media minh họa trang tin tức", mediaUrl: "", mediaType: "image", altText: "Khu vườn canh tác" },
];

async function run() {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed media settings into production.");
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  await connectDB();
  if (mongoose.connection.name !== "webdl2") throw new Error(`Expected database webdl2; received ${mongoose.connection.name}.`);
  for (const row of defaults) await SiteMedia.updateOne({ key: row.key }, { $setOnInsert: row }, { upsert: true });
  console.log(JSON.stringify({ database: mongoose.connection.name, mediaSettings: await SiteMedia.countDocuments({ key: { $in: defaults.map((row) => row.key) } }) }, null, 2));
}

run().then(() => mongoose.disconnect()).catch(async (error) => { console.error(`${error.name}: ${error.message}`); await mongoose.disconnect(); process.exitCode = 1; });

