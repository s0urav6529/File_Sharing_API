//external module
const express = require("express");
const deleteRoute = express.Router();

//internal module
const deleteResponse = require("../controllers/deleteController");

//route to use
deleteRoute.route("/:privateKey").delete(deleteResponse);

// export
module.exports = deleteRoute;
