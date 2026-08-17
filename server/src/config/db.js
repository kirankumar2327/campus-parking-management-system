const mongoose = require("mongoose");
const { getRequiredEnv } = require("./env");

const connectDb = async () => {
  try {
    const mongoUri = getRequiredEnv("MONGODB_URI");
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDb;
