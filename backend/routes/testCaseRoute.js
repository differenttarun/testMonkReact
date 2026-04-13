const express = require("express");
const TestCase = require("../models/TestCase");
const TestSuiteTestCaseMapping = require("../models/TestSuiteTestCaseMapping");
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

// ROUTE 1  delete Test case
router.delete("/delete/:id", async (req, res) => {
  try {
    const testCaseId = Number(req.params.id);

    if (!testCaseId) {
      return res.status(400).json({
        message: "Invalid testCaseId",
      });
    }

    const mappingResult = await TestSuiteTestCaseMapping.deleteMany({
      testCaseId: testCaseId,
    });

    console.log(
      `Deleted ${mappingResult.deletedCount} mappings for suite ${testCaseId}`,
    );

    const deletedTest = await TestCase.findOneAndDelete({
      testCaseId: testCaseId,
    });

    if (!deletedTest) {
      return res.status(404).json({
        message: `Test Case with id ${suiteId} not found`,
      });
    }

    return res.status(200).json({
      message: "Test Case deleted successfully",
      data: deletedTest,
    });
  } catch (error) {
    console.error("Delete Error:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
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

router.put("/:id", async (req, res) => {
  try {
    const testCaseId = Number(req.params.id);

    const updated = await TestCase.findOneAndUpdate(
      { testCaseId },
      {
        testCaseName: req.body.testCaseName,
        testScriptId: req.body.testScriptId,
      },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Test case not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
