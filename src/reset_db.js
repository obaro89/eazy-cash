const db = require("./db");

const Account = require("./models/account");
const User = require("./models/user");
const Transaction = require("./models/transaction");

const reset = async () => {
  try {
    await db.connect();
    let users = await User.deleteMany();
    console.log(`Deleted ${users.deletedCount} User documents`);
    let account = await Account.deleteMany();
    console.log(`Deleted ${account.deletedCount} Account documents`);
    let txn = await Transaction.deleteMany();
    console.log(`Deleted ${txn.deletedCount} Transaction documents`);
  } catch (error) {
    console.log(error);
  } finally {
    await db.disconnect();
  }
};

reset();
