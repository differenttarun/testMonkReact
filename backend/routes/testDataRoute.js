const express = require("express");
const TestData = require("../models/TestData");
const router = express.Router();

// Sample route
router.post("/create", async (req, res) => {
  try {
    const testData = TestData(req.body);
    await testData.save();
    return res.json({
      message: "Test Data created successfully",
      id: testData.testDataId, // auto-generated ID
      _id: testData._id, // MongoDB default ID
    });
  } catch (error) {
    if (error.code === 11000) {
      console.error(
        "Error while Generating test suite test case mapping:  " + error,
      );
      return res.status(400).json({
        message: "Test Data already present for env,key and value",
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});

// ROUTE 3: get ResourceModels by modelName
router.get(
  "/fetchTestDataByTestCaseIDAndEnv/:testCaseId/:env",
  async (req, res) => {
    try {
      const testCaseId = Number(req.params.testCaseId);
      const env = req.params.env;

      const testDataList = await TestData.find({
        testCaseId: testCaseId,
        env: env,
      });

      if (testDataList.length === 0) {
        return res.status(404).json({
          message:
            "testData with testCaseid " +
            testCaseId +
            " and env " +
            env +
            " not found",
        });
      }

      res.status(200).json(testDataList);
    } catch (error) {
      console.error("Error fetching ResourceModel:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

module.exports = router;
