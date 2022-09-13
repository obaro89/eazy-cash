const db = require("./db");
const service = require("./services/user_service");
const User = require("./models/user");

// 1. Each new user gets a cash account.
// 2. A user can add bank or credit card account.
// 3. A user can pay another user.
const main = async () => {
  try {
    await db.connect();
    const fela = await service.register(
      "Fela",
      "Kuti",
      "abami",
      "fela@kuti.com",
      "legendary00"
    );
    const adam = await service.register(
      "Adam",
      "Smith",
      "asmith",
      "adam@smith.com",
      "econ_$$_00"
    );
    await service.addCash(fela.userid, 100000);
    await service.pay(
      fela.userid,
      adam.userid,
      fela.getCashAccount()._id,
      10000,
      "enjoy."
    );
    console.log("Transfer completed!");
    console.log(
      `Fela's cash balance: ${
        (await User.findOne({ userid: fela.userid })).balance
      }`
    );
    console.log(
      `Adam's cash balance: ${
        (await User.findOne({ userid: adam.userid })).balance
      }`
    );
  } catch (error) {
    console.log(error);
  } finally {
    await db.disconnect();
  }
};

main();
