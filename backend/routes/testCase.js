const express = require("express");
const TestCase = require("../models/TestCase");
const router = express.Router();

// Sample route
router.get("/create", async (req, res) => {
  try {
    const testCase = TestCase(req.body);
    await testCase.save();
    return res.json({
      message: "Test Case created successfully",
      id: testCase.testCaseId, // auto-generated ID
      _id: testCase._id, // MongoDB default ID
    });
  } catch (err) {
    console.error("Error while Generating test case:  " + err);
  }
});

module.exports = router;
