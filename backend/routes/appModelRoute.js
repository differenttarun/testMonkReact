const express = require("express");
const AppModel = require("../models/AppModel");
const router = express.Router();

// Sample route
router.post("/create", async (req, res) => {
  try {
    const appModel = AppModel(req.body);
    await appModel.save();
    return res.json({
      message: "AppModel created successfully",
      id: appModel.appModelId, // auto-generated ID
      _id: appModel._id, // MongoDB default ID
    });
  } catch (error) {
    if (error.code === 11000) {
      console.error("Error while Generating AppModel:  " + error);
      return res.status(400).json({
        message: "AppModel Aleady present for Model and key",
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});

module.exports = router;
