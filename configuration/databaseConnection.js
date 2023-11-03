const mongoose = require("mongoose");

const databaseConnection = async () => {
  mongoose
    .connect(process.env.MONGOURL)
    .then(console.log("Database connection established!"))
    .catch((err) => console("Database not connected"));
};

module.exports = databaseConnection;
