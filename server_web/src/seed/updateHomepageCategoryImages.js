require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");

// Editorial crops for the six categories displayed on the storefront homepage.
// Keep these as URL values so the cards render the same images across deployments.
const categories = [
  { id: "6abb854f706f8607daf6e819", key: "gia-the-trong-cay", photo: "photo-1497250681960-ef046c08a56e" },
  { id: "6abb854f706f8607daf6e816", key: "vuon-uom-cham-soc", photo: "photo-1669065513971-a4f689d83a22" },
  { id: "6abb854f706f8607daf6e813", key: "he-thong-tuoi", photo: "photo-1592982537447-7440770cbfc9" },
  { id: "6abb854e706f8607daf6e810", key: "phu-kien-nha-kinh", photo: "photo-1585320806297-9794b3e4eeae" },
  { id: "6abb854e706f8607daf6e80d", key: "khung-ket-cau-nha-kinh", photo: "photo-1464226184884-fa280b87c399" },
  { id: "6abb854e706f8607daf6e80a", key: "mang-phu-luong", photo: "photo-1500382017468-9049fed747ef" },
];

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured");
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to update demo category images in production.");
  await mongoose.connect(process.env.MONGODB_URI);

  const ids = categories.map(({ id }) => new mongoose.Types.ObjectId(id));
  const found = await Category.find({ _id: { $in: ids } }).select("_id name slug").lean();
  if (found.length !== categories.length) {
    const foundIds = new Set(found.map((row) => String(row._id)));
    const missing = categories.filter(({ id }) => !foundIds.has(id)).map(({ id, key }) => `${key} (${id})`);
    throw new Error(`Category records not found; no changes made: ${missing.join(", ")}`);
  }

  const operations = categories.map(({ id, photo }) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(id) },
      update: { $set: { homeImage: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1200&h=900&q=85` } },
    },
  }));
  const result = await Category.bulkWrite(operations);
  const verified = await Category.countDocuments({ _id: { $in: ids }, homeImage: { $regex: /^https:\/\/images\.unsplash\.com\// } });
  if (verified !== categories.length) throw new Error(`Image verification failed: ${verified}/${categories.length}`);
  console.log(JSON.stringify({ database: mongoose.connection.name, matched: result.matchedCount, updated: result.modifiedCount, verified, categories: found.map(({ name, slug }) => ({ name, slug })) }, null, 2));
}

main().catch((error) => {
  console.error(`${error.name}: ${error.message}`);
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.disconnect();
});
