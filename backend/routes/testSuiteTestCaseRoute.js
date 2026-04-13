const express = require("express");
const router = express.Router();
const TestSuiteTestCaseMapping = require("../models/TestSuiteTestCaseMapping");
const TestCase = require("../models/TestCase");
const TestSuite = require("../models/TestSuite");

router.post("/create", async (req, res) => {
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

// DELETE mapping
router.post("/delete", async (req, res) => {
  try {
    const { testSuiteId, testCaseId, env } = req.body;

    if (!testSuiteId || !testCaseId || !env) {
      return res.status(400).json({
        message: "testSuiteId, testCaseId and env are required",
      });
    }

    const deleted = await TestSuiteTestCaseMapping.findOneAndDelete({
      testSuiteId,
      testCaseId,
      env,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Mapping not found",
      });
    }

    res.json({
      message: "Mapping deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.get("/fetchTestCasesBySuiteIdAndEnv/:id/:env", async (req, res) => {
  try {
    const suiteId = Number(req.params.id);
    const env = req.params.env;

    const result = await TestSuiteTestCaseMapping.aggregate([
      // ✅ Step 1: Filter by suite + env
      {
        $match: {
          testSuiteId: suiteId,
          env: env,
        },
      },

      // ✅ Step 2: Lookup test case
      {
        $lookup: {
          from: "testcases",
          localField: "testCaseId",
          foreignField: "testCaseId",
          as: "testCase",
        },
      },

      // ✅ Step 3: Unwind testCase
      { $unwind: "$testCase" },

      // ✅ Step 4: Attach env to test case
      {
        $addFields: {
          "testCase.env": "$env",
        },
      },

      // ✅ Step 5: Group into list
      {
        $group: {
          _id: "$testSuiteId",
          testSuiteId: { $first: "$testSuiteId" },
          testCaseList: { $push: "$testCase" },
        },
      },
    ]);

    res.json(result[0] || { testSuiteId: suiteId, testCaseList: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
