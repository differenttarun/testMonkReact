const express = require("express");
const TestSuite = require("../models/TestSuite");
const TestSuiteTestCaseMapping = require("../models/TestSuiteTestCaseMapping");
const TestCase = require("../models/TestCase");
const router = express.Router();

// ROUTE 1  create Test Suite
router.post("/create", async (req, res) => {
  try {
    const testSuite = TestSuite(req.body);
    await testSuite.save();
    return res.json({
      message: "Test Suite created successfully",
      testSuiteId: testSuite.testSuiteId, // auto-generated ID
      _id: testSuite._id, // MongoDB default ID
    });
  } catch (err) {
    console.error("Error while Generating test suite:  " + err);
  }
});

// ROUTE 1  create Test Suite
router.delete("/delete/:id", async (req, res) => {
  try {
    const suiteId = Number(req.params.id);

    if (!suiteId) {
      return res.status(400).json({
        message: "Invalid testSuiteId",
      });
    }

    const mappingResult = await TestSuiteTestCaseMapping.deleteMany({
      testSuiteId: suiteId,
    });

    console.log(
      `Deleted ${mappingResult.deletedCount} mappings for suite ${suiteId}`,
    );

    const deletedSuite = await TestSuite.findOneAndDelete({
      testSuiteId: suiteId,
    });

    if (!deletedSuite) {
      return res.status(404).json({
        message: `Test Suite with id ${suiteId} not found`,
      });
    }

    return res.status(200).json({
      message: "Test Suite deleted successfully",
      data: deletedSuite,
    });
  } catch (error) {
    console.error("Delete Error:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// ROUTE 2:  get All suites
router.get("/fetchAllSuites", async (req, res) => {
  try {
    const suites = await TestSuite.find();

    return res.json(suites);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching test suites",
      error: error.message,
    });
  }
});

// ROUTE 3:  get suite by id
router.get("/fetchSuiteById/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const suite = await TestSuite.findOne({
      testSuiteId: req.params.id,
    });

    if (!suite) {
      return res
        .status(404)
        .json({ message: "Suite  with id " + id + "not found" });
    }

    res.status(200).json(suite);
  } catch (error) {
    console.error("Error fetching suite:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/fetchTestCasesBySuiteId/:id", async (req, res) => {
  try {
    const suiteId = Number(req.params.id);

    const result = await TestSuite.aggregate([
      { $match: { testSuiteId: suiteId } },

      // 🔹 Step 1: Get mappings
      {
        $lookup: {
          from: "testsuitetestcasemappings",
          localField: "testSuiteId",
          foreignField: "testSuiteId",
          as: "mappings",
        },
      },

      // 🔹 Step 2: Unwind mappings (VERY IMPORTANT)
      { $unwind: "$mappings" },

      // 🔹 Step 3: Lookup test case for each mapping
      {
        $lookup: {
          from: "testcases",
          localField: "mappings.testCaseId",
          foreignField: "testCaseId",
          as: "testCase",
        },
      },

      // 🔹 Step 4: Unwind testCase
      { $unwind: "$testCase" },

      // 🔹 Step 5: Merge env into test case
      {
        $addFields: {
          "testCase.env": "$mappings.env",
        },
      },

      // 🔹 Step 6: Group back into list
      {
        $group: {
          _id: "$_id",
          testSuiteId: { $first: "$testSuiteId" },
          testSuiteName: { $first: "$testSuiteName" },
          testCaseList: { $push: "$testCase" },
        },
      },
    ]);

    // if (!result.length) {
    //   return res.status(404).json({
    //     message: `Suite with id ${suiteId} not found`,
    //   });
    // }

    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
