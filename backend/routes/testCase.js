const express = require("express");
const router = express.Router();

// Sample route
router.get("/", (req, res) => {
  res.send("Test Case API working");
});

module.exports = router; 