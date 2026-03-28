const express = require("express");
const TestCase = require("../models/TestCase");
const router = express.Router();

// ROUTE 1: create test case
router.post("/create", async (req, res) => {
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

// ROUTE 2: get All test case
router.get("/fetchAllTestCase", async (req, res) => {
  try {
    const testCases = await TestCase.find();

    return res.json(testCases);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching test testCases",
      error: error.message,
    });
  }
});

// ROUTE 3: get test case by id
router.get("/fetchTestCaseById/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const testCase = await TestCase.findOne({
      testCaseId: req.params.id,
    });

    if (!testCase) {
      return res
        .status(404)
        .json({ message: "TestCase with id " + id + " not found " });
    }

    res.status(200).json(testCase);
  } catch (error) {
    console.error("Error fetching testCase:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
