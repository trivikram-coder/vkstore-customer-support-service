const express = require("express");
const router = express.Router();

const { chatWithCustomer } = require("../controllers/customer.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/chat",verifyToken, chatWithCustomer);

module.exports = router;