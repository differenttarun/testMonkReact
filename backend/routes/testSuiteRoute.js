const express = require("express");
const TestSuite = require("../models/TestSuite");
const router = express.Router();

// ROUTE 1  create Test Suite
router.post("/create", async (req, res) => {
  try {
    const testSuite = TestSuite(req.body);
    await testSuite.save();
    return res.json({
      message: "Test Suite created successfully",
      id: testSuite.testSuiteId, // auto-generated ID
      _id: testSuite._id, // MongoDB default ID
    });
  } catch (err) {
    console.error("Error while Generating test suite:  " + err);
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

module.exports = router;
