const express = require("express");
const router = express.Router();
const TestSuiteTestCaseMapping = require("../models/TestSuiteTestCaseMapping");
const TestCase = require("../models/TestCase");
const TestSuite = require("../models/TestSuite");

router.get("/create", async (req, res) => {
  try {
    const testSuiteTestCaseMapping = TestSuiteTestCaseMapping(req.body);

    const testCase = await TestCase.findOne({
      testCaseId: req.body.testCaseId,
    });
    const testSuite = await TestSuite.findOne({
      testSuiteId: req.body.testSuiteId,
    });

    if (!testCase) {
      return res.status(404).json({ message: "TestCase not found" });
    }
    if (!testSuite) {
      return res.status(404).json({ message: "TestSuite not found" });
    }

    await testSuiteTestCaseMapping.save();
    return res.json({
      message: "Test suite test case mapping created successfully",
      id: testSuiteTestCaseMapping.testSuiteTestCaseMappingId, // auto-generated ID
      _id: testSuiteTestCaseMapping._id, // MongoDB default ID
    });
  } catch (error) {
    if (error.code === 11000) {
      console.error(
        "Error while Generating test suite test case mapping:  " + error,
      );
      return res.status(400).json({
        message:
          "Mapping already exists for this testSuiteId, testCaseId and env",
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});

module.exports = router;
