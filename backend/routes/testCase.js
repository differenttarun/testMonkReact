const express = require("express");
const TestCase = require("../models/TestCase");
const router = express.Router();

// Sample route
router.get("/create", async (req, res) => {
  console.log(req.body);

  try {
    const testCase = TestCase(req.body);
    await testCase.save();
    return res.json({
      message: "Test Case successfully",
      id: testCase.testCaseId, // 👈 your auto-generated ID
      _id: testCase._id, // 👈 MongoDB default ID
    });
    console.log("Test case Created");
    res.send(req.body);
  } catch (err) {
    console.error("Error while Generating test case:  " + err);
  }
});

module.exports = router;
