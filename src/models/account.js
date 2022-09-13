const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Subdocuments are documents embedded in other documents.
// In Mongoose, we can nest schema in other schemas.
// Nested schemas can have custom validation logic,
// and other features that top-lvel schemas can use
const bankInfoSchema = new Schema({
  bankName: { type: String, required: true },
  acctNumber: { type: String, required: true },
});

const cardInfoSchema = new Schema({
  // Strings have built-in minlength and maxlength validators
  cardNumber: { type: String, required: true, minlength: 16, maxlength: 16 },
  // Strings also match validator that takes a regex
  exp: {
    type: String,
    match: /\d{2}\/\d{4}/, // e.g 05/2023
    required: true,
  },
});

// Create schema (i.e shape) of the account document.
const AccountSchema = new Schema(
  {
    type: {
      type: String,
      // type be only be one Bank, Credit Card or Cash
      enum: ["Bank", "Credit Card", "Cash"],
      required: true,
    },
    bankInfo: {
      type: bankInfoSchema,
      // A custom validation is declared by passing a validation function.
      // Here we're checking that a bankInfo should only be specified when
      // the type is set to Bank
      validate: {
        validator: function (value) {
          // truthy or undefine -- valid
          // falsy or false -- invalid
          return this.type === "Bank";
        },
        // A function that returns the error message for this validation.
        message: (props) => "type should be set to 'Bank'",
      },
    },
    cardInfo: {
      type: cardInfoSchema,
    },
  },
  { timestamps: true }
);

// A custom validation can also be defined this way.
AccountSchema.path("cardInfo").validate(function (value) {
  return this.type === "Credit Card";
}, "type should be set to 'Credit Card'");

const Account = mongoose.model("accounts", AccountSchema);

module.exports = Account;
