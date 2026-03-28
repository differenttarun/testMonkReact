const express = require("express");
const TestSuite = require("../models/TestSuite");
const router = express.Router();

// Sample route
router.get("/create", async (req, res) => {
  try {
    const testSuite = TestSuite(req.body);
    await testSuite.save();
    return res.json({
      message: "Test Suite created successfully",
      id: testSuite.testSuiteId, // auto-generated ID
      _id: testSuite._id, // MongoDB default ID
    });
  } catch (err) {
    console.error("Error while Generating test suite:  " + err);
  }
});

module.exports = router;
