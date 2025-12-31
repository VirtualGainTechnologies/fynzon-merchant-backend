const express = require("express");
const Router = express.Router();
const {
  generatePdfController,
} = require("../../controllers/merchant/generatePdfController");

Router.route("/generate-invoice-pdf").post(generatePdfController);

module.exports = Router;
