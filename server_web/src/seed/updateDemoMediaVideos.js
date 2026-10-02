require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const Category = require("../models/Category");
const Banner = require("../models/Banner");
const NewsArticle = require("../models/NewsArticle");
const NewsCategory = require("../models/NewsCategory");
const OrderItem = require("../models/OrderItem");

// Public sample clips whose URLs were verified to return HTTP 200 and video/*.
const videoUrls = [
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://www.w3schools.com/html/movie.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
  "https://media.w3.org/2010/05/bunny/trailer.mp4",
  "https://media.w3.org/2010/05/bunny/movie.mp4",
  "https://media.w3.org/2010/05/video/movie_300.mp4",
  "https://media.w3.org/2010/05/video/movie_300.webm",
];

const fieldsByModel = [
  [Product, ["thumbnail", "images", "video"]],
  [ProductVariant, ["thumbnail", "images"]],
  [Category, ["image", "homeImage"]],
  [Banner, ["imageUrl", "mobileImageUrl"]],
  [NewsArticle, ["coverImage"]],

  [NewsCategory, ["coverImage"]],
  [OrderItem, ["image"]],
];

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  await mongoose.connect(process.env.MONGODB_URI);
  if (mongoose.connection.name !== "webdl2") {
    throw new Error(`Refusing to change media outside webdl2; connected to ${mongoose.connection.name}.`);
  }

  let cursor = 0;
  let updatedRecords = 0;
  let replacedUrls = 0;
  for (const [Model, fields] of fieldsByModel) {
    const records = await Model.find().sort({ _id: 1 });
    const operations = records.map((record) => {
      const update = {};
      for (const field of fields) {
        const value = record.get(field);
        if (Array.isArray(value)) {
          if (value.length) {
            update[field] = value.map(() => videoUrls[cursor++ % videoUrls.length]);
            replacedUrls += value.length;
          }
        } else if (typeof value === "string" && value.trim()) {
          update[field] = videoUrls[cursor++ % videoUrls.length];
          replacedUrls += 1;
        }
      }
      if (!Object.keys(update).length) return null;
      updatedRecords += 1;
      return { updateOne: { filter: { _id: record._id }, update: { $set: update } } };
    }).filter(Boolean);
    if (operations.length) await Model.bulkWrite(operations);
  }

  const remainingImages = [];
  let verifiedVideos = 0;
  for (const [Model, fields] of fieldsByModel) {
    for (const record of await Model.find().lean()) {
      for (const field of fields) {
        const value = record[field];
        for (const url of Array.isArray(value) ? value : [value]) {
          if (typeof url !== "string" || !url.trim()) continue;
          if (/\.(mp4|webm|ogg|mov|m4v)(?:$|[?#])/i.test(url)) verifiedVideos += 1;
          else remainingImages.push(`${Model.modelName}.${field}`);
        }
      }
    }
  }
  if (remainingImages.length) throw new Error(`Media verification found ${remainingImages.length} non-video URLs.`);
  console.log(JSON.stringify({ database: mongoose.connection.name, updatedRecords, replacedUrls, verifiedVideos, distinctVideoSources: videoUrls.length }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(async () => {
  if (mongoose.connection.readyState) await mongoose.disconnect();
});









