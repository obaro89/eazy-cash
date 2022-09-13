// Import the mongoose module
const mongoose = require("mongoose");

// Import the crypto module from nodejs.
// The crypto module provides cryptographic functionality that includes a set of wrappers for
// OpenSSL's hash, HMAC, cipher, decipher, sign, and verify functions.
const crypto = require("crypto");

// Import Account model.
const Account = require("./account");

// Create alias (or shortcut) for the mongoose.Schema class
const Schema = mongoose.Schema;

// Create schema (i.e shape) of the user document.
const UserSchema = new Schema(
  {
    // firstname & lastname  fields are of type string and the fields are required.
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    // unique: true will create a MongoDB unique index
    // it doesn't actually perform a unique validate before saving.
    userid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    salt: { type: String, required: false },
    // accounts is an array of ObjectIds
    accounts: [Schema.Types.ObjectId],
    // we can provide a default value for field.
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// We're using the pbkdf2Sync method on the crypto module to generatea secure hash for a password.
const hash = (password, salt) =>
  crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");

// We can provide methods that will be available on instances (i.e Documents) of Models
// created with this schema. 
// e.g const User = mongoose.model("users", UserSchema);
//     const user = new User()     -- user is a document
//     user.setPassword('secret')  -- setPassword is instance method on the user document. 

// Generates a random salt and uses that to compute a secure hash for the password.
UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.password = hash(password, this.salt);
};

// Checks that password is valid, be recomputing the hash and comparing it to the saved password.
UserSchema.methods.validPassword = function (password) {
  return this.password === hash(password, this.salt);
};

// Increase user's balance
UserSchema.methods.increaseBalance = async function (amount) {
  this.balance += amount
  await this.save()
};


// Performs a lookup to obtain a user's cash account. 
// A user can have one and only one cash account.
UserSchema.methods.getCashAccount = async function () {
  const acct = await Account.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "accounts",
        as: "users",
      },
    },
    {
      $match: {
        "users.0._id": this._id,
        type: "Cash",
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ]);
  return acct[0]._id;
};

// We can also add static functions to our model.
// e.g const User = mongoose.model("users", UserSchema);
//     User.findByUserId('cuteasbee')
UserSchema.statics.findByUserId = async function (userid) {
  const user = await this.findOne({ userid: userid });
  if (!user) {
    throw new Error(`User ${userid} not found`);
  }
  return user;
};

// Models are responsible for creating and reading documents from the underlying MongoDB database.
// Models are compiled from Schema definitions. An instance of a model is called a document. 
const User = mongoose.model("users", UserSchema);

module.exports = User;
