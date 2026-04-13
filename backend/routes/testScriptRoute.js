const express = require("express");
const TestScript = require("../models/TestScript");
const router = express.Router();

// ROUTE 1: create test script
router.post("/create", async (req, res) => {
  try {
    const testScript = TestScript(req.body);
    await testScript.save();
    return res.json({
      message: "Test Script created successfully",
      id: testScript.testScriptId, // auto-generated ID
      _id: testScript._id, // MongoDB default ID
    });
  } catch (err) {
    console.error("Error while Generating test script:  " + err);
  }
});

// ROUTE 2: get All test script
router.get("/fetchAllTestScript", async (req, res) => {
  try {
    const testScripts = await TestScript.find();

    return res.json(testScripts);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching test testScripts",
      error: error.message,
    });
  }
});

// ROUTE 3: get test case by id
router.get("/fetchTestScriptById/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const testScript = await TestScript.findOne({
      testScriptId: req.params.id,
    });

    if (!testScript) {
      return res
        .status(404)
        .json({ message: "TestScript with id " + id + " not found " });
    }

    res.status(200).json(testScript);
  } catch (error) {
    console.error("Error fetching testScript:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const updated = await TestScript.findOneAndUpdate(
      { testScriptId: id },
      { $set: req.body },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({
        message: "Test Script not found",
      });
    }

    res.json({
      message: "Test Script updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error updating Test Script",
    });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const deleted = await TestScript.findOneAndDelete({
      testScriptId: id,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Test Script not found",
      });
    }

    res.json({
      message: "Test Script deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error deleting Test Script",
    });
  }
});

module.exports = router;
