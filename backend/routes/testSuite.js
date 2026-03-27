const express = require("express");
const router = express.Router();

// Sample route
router.get("/", (req, res) => {
  res.send("Test Suite API working");
});

module.exports = router; 