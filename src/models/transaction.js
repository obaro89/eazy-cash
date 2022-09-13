// Import the mongoose module
const mongoose = require("mongoose");

// Create alias (or shortcut) for the mongoose.Schema class
const Schema = mongoose.Schema;

// Create schema (i.e shape) of the Transaction document.
const TransactionSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, required: true },
    recipient: { type: Schema.Types.ObjectId },
    sourceAcct: { type: Schema.Types.ObjectId, required: true },
    destAcct: { type: Schema.Types.ObjectId },
    amount: { type: Number },
    // By providing an enum we're saying that status can only be one
    // of the enum values Pending, Completed, Failed.
    status: { type: String, enum: ["Pending", "Completed", "Failed"] },
    note: String,
  },
  { timestamps: true }
);

// Models are responsible for creating and reading documents from the underlying MongoDB database.
// Models are compiled from Schema definitions. An instance of a model is called a document. 
const Transaction = mongoose.model("transactions", TransactionSchema);

module.exports = Transaction;
