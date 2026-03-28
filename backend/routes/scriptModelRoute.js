const express = require("express");
const ScriptModel = require("../models/ScriptModel");
const router = express.Router();

// Sample route
router.post("/create", async (req, res) => {
  try {
    const scriptModel = ScriptModel(req.body);
    await scriptModel.save();
    return res.json({
      message: "ScriptModel created successfully",
      id: scriptModel.scriptModelId, // auto-generated ID
      _id: scriptModel._id, // MongoDB default ID
    });
  } catch (error) {
    if (error.code === 11000) {
      console.error("Error while Generating ScriptModels:  " + error);
      return res.status(400).json({
        message: "ScriptModel Aleady present for Model and key",
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});

module.exports = router;
