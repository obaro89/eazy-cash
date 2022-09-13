# Easycash Sample App.

This basic project shows how to use [Mongoose](https://mongoosejs.com/) to connect a [MongoDB](https://www.mongodb.com/) database in [Nodejs](https://nodejs.org/en/).

### Models
There are 3 model files in the `src/models` directory.

### Service
The `user_service.js` file in the `src/services` director provides functions that uses the models to:
- `register`: register a user
- `addBankAccount`: add a bank account
- `addCreditCard`: add a credit card
- `pay`: transfer money from one user to another
- `addCash`: fund a user's cash account.

## To run the app
1. Create `.env` file and set the `DB_URI` environment variable to point your Mongodb Server.
2. Run `npm install`
3. Run `npm start`

To try different methods in the user_service, edit the `main` function in `app.js`
## To clear the database
Run `npm resetdb`




