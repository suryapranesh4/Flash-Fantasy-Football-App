const mongoose = require("mongoose");
mongoose.set("useUnifiedTopology", true);
mongoose.set("useFindAndModify", false);
const config = require("config");
const db = process.env.MONGO_URI || config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(db, { useNewUrlParser: true, useCreateIndex: true });
    console.log("MongoDB is connected!");
  } catch (err) {
    console.log("MongoDB conection error :", err.message);
    //Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
