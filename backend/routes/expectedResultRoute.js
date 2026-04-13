const express = require("express");
const ExpectedResult = require("../models/ExpectedResult");
const router = express.Router();

// ROUTE 1: create test script
router.post("/create", async (req, res) => {
  try {
    const expectedResult = ExpectedResult(req.body);
    await expectedResult.save();
    return res.json({
      message: "ExpectedResult created successfully",
      id: expectedResult.expectedResultId, // auto-generated ID
      _id: expectedResult._id, // MongoDB default ID
    });
  } catch (error) {
    console.error("Error while Generating ExpectedResult:  " + error);
    if (error.code === 11000) {
      console.error("Error while Generating AppModel:  " + error);
      return res.status(400).json({
        message: "ExpectedResult aleady present for Model and key",
      });
    }
  }
});

// ROUTE 2: get All test script
router.get("/fetchAllExpectedResults", async (req, res) => {
  try {
    const expectedResults = await ExpectedResult.find();

    return res.json(expectedResults);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching test expectedResults",
      error: error.message,
    });
  }
});

// ROUTE 3: get test case by id
router.get(
  "/fetchExpectedResultByTestCaseIDAndEnv/:testCaseId/:env",
  async (req, res) => {
    try {
      const testCaseId = Number(req.params.testCaseId);

      const env = req.params.env;

      const expectedResults = await ExpectedResult.find({
        testCaseId: testCaseId,
        env: env,
      });

      if (!expectedResults) {
        return res
          .status(404)
          .json({ message: "expectedResults with id " + id + " not found " });
      }

      res.status(200).json(expectedResults);
    } catch (error) {
      console.error("Error fetching expectedResults:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// ROUTE 3: get test case by id
router.get("/fetchActivityByTestScriptId/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const activities = await Activity.find({
      testScriptId: req.params.id,
    });

    if (!activities) {
      return res
        .status(404)
        .json({ message: "Activity with testScriptId " + id + " not found " });
    }

    const ts = {
      scriptId: id,
      scriptName: "todo",
      activityList: activities,
    };
    res.status(200).json(ts);
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const updated = await ExpectedResult.findOneAndUpdate(
      { expectedResultId: id },
      { $set: req.body },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({
        message: "Expected Result not found",
      });
    }

    res.json({
      message: "Expected Result updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error updating Expected Result",
    });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const deleted = await ExpectedResult.findOneAndDelete({
      expectedResultId: id,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Expected Result not found",
      });
    }

    res.json({
      message: "Expected Result deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error deleting Expected Result",
    });
  }
});

module.exports = router;
