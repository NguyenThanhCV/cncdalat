require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const rolePermissions = require("../constants/rolePermissions");

async function run() {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to sync demo role permissions in production.");
  await connectDB();
  if (mongoose.connection.name !== "webdl2") throw new Error(`Refusing to update ${mongoose.connection.name}; expected webdl2.`);
  const counts = {};
  for (const [role, permissions] of Object.entries(rolePermissions)) {
    const result = await User.updateMany({ role }, { $set: { permissions } });
    counts[role] = result.modifiedCount ?? result.nModified ?? 0;
  }
  console.log(JSON.stringify({ database: mongoose.connection.name, synchronizedUsers: counts }, null, 2));
}

run().catch((error) => {
  console.error(`${error.name}: ${error.message}`);
  process.exitCode = 1;
}).finally(async () => {
  if (mongoose.connection.readyState) await mongoose.disconnect();
});
