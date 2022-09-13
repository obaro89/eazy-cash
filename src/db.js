require("dotenv").config();

const mongoose = require("mongoose");

// By default, mongoose buffers commands when the connection goes down until the driver manages to
// reconnect. This prevent mongoose from throwing an error even when the database is not connected.
// We disable buffering by setting bufferCommands to false.
mongoose.set("bufferCommands", false);

const connect = async () => {
  try {
    await mongoose.connect(`${process.env.DB_URI}/easy_cash`, {
      useUnifiedTopology: true,
      useCreateIndex: true,
      useNewUrlParser: true,
    });
    console.log("Connected to db. \n");
  } catch (error) {
    console.log("Error connecting to db: ", error);
  }
};

module.exports = { connect, disconnect: mongoose.disconnect };
