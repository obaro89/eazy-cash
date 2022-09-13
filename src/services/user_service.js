const User = require("../models/user");
const Account = require("../models/account");
const Transaction = require("../models/transaction");

/**
 * Create a new user and also creates cash account for the user.
 * @param {string} firstname
 * @param {string} lastname
 * @param {string} userid
 * @param {string} email
 * @param {string} password
 */
const register = async (firstname, lastname, userid, email, password) => {
  try {
    // create new user.
    const user = new User({
      firstname,
      lastname,
      userid,
      email,
    });
    user.setPassword(password);

    // create new cash account
    let cashAcct = new Account({
      type: "Cash",
    });
    cashAcct = await cashAcct.save();

    // add new cash account to the user's accounts list.
    user.accounts.push(cashAcct._id);
    return await user.save();
  } catch (error) {
    console.log(error);
  }
};
/**
 * Create new bank account for a user.
 * @param {string} userId
 * @param {string} bankName
 * @param {string} acctNumber
 */
const addBankAccount = async (userId, bankName, acctNumber) => {
  try {
    // call the static findByUserId to retrieve user acount
    const user = await User.findByUserId(userId);

    // create new bank account
    const acct = new Account({
      type: "Bank",
      bankInfo: {
        bankName,
        acctNumber,
      },
    });
    await acct.save();

    // add bank account to user's account list.
    await User.updateOne(
      {
        _id: user._id,
      },
      {
        accounts: [...user.accounts, acct._id],
      }
    );
    return acct;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Create new credit card account for a user.
 * @param {string} userId
 * @param {string} bankName
 * @param {string} acctNumber
 */
const addCreditCard = async (userId, cardNumber, exp) => {
  try {
    // call the static findByUserId to retrieve user acount
    const user = await User.findByUserId(userId);

    // create new credit card account
    const acct = new Account({
      type: "Credit Card",
      cardInfo: {
        cardNumber,
        exp,
      },
    });
    await acct.save();

    // add credit card account to user's account list.
    await User.updateOne(
      {
        _id: user._id,
      },
      {
        accounts: [...user.accounts, acct._id],
      }
    );

    return acct;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Increase user's cash balance
 * @param {string} userId 
 * @param {number} amount 
 */
const addCash = async(userId, amount) => {
  const user = await User.findByUserId(userId);
  await user.increaseBalance(amount)
}
/**
 * Send money from one user to another.
 * @param {string} userId 
 * @param {string} recpId 
 * @param {string | undefined} source 
 * @param {number} amount 
 * @param {string} note 
 */
const pay = async (userId, recpId, source, amount, note) => {
  try {
    // Lookup send and recipient users.
    const user = await User.findByUserId(userId);
    const recp = await User.findByUserId(recpId);

    // if a source account is specified,
    // check that account exist and belongs to the user.
    if (source) {
      const acct = await Account.findById(source).exec();
      if (user.accounts.indexOf(acct._id) < 0) {
        throw new Error("Account does not exist");
      }
    }

    // call instance methods getCashAccount to retrieve the sender's account
    const cashAcct = await user.getCashAccount();

    // check that user has enough balance to send money using their cash account.
    if (!source || source === cashAcct) {
      if (user.balance < amount) {
        throw new Error("Insufficient balance");
      }
    }
    // ACID (atomicity, consistency, isolation, durability) is a set of properties of database 
    // transactions intended to guarantee data validity despite errors, power failures, and other 
    // mishaps.
    // Atomicity is the guarantee that series of database operations in an atomic transaction will /// either all occur (a successful operation), or none will occur (an unsuccessful operation). 
    // Transaction ensures that a series of operations all succeed or are all rolled back.
    const session = await Transaction.startSession();
    await session.withTransaction(async () => {
      if (cashAcct) {
        await User.updateOne(
          {
            _id: user._id,
          },
          {
            balance: user.balance - amount,
          }
        );
         await User.updateOne(
           {
             _id: recp._id,
           },
           {
             balance: recp.balance + amount,
           }
         );
      }
      const txn = new Transaction();
      txn.sender = user._id;
      txn.recipient = recp._id;
      txn.sourceAcct = source || cashAcct;
      txn.destAcct = await recp.getCashAccount();
      txn.amount = amount;
      txn.note = note;

      return txn.save();
    });

    session.endSession();
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  register,
  addBankAccount,
  addCreditCard,
  pay,
  addCash
};
