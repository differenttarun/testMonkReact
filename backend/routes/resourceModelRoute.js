const express = require("express");
const ResourceModel = require("../models/ResourceModel");
const router = express.Router();

// Sample route
router.post("/create", async (req, res) => {
  try {
    const resourceModel = ResourceModel(req.body);
    await resourceModel.save();
    return res.json({
      message: "ResourceModel created successfully",
      id: resourceModel.resourceModelId, // auto-generated ID
      _id: resourceModel._id, // MongoDB default ID
    });
  } catch (error) {
    if (error.code === 11000) {
      console.error("Error while Generating ResourceModel:  " + error);
      return res.status(400).json({
        message: "ResourceModel Aleady present for Model and key and env",
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});

module.exports = router;
