const express = require("express");
const ResourceModel = require("../models/ResourceModel");
const router = express.Router();
const { body, validationResult } = require("express-validator");

// Sample route
router.post(
  "/create",
  [
    body("modelName", "Model Name should be of minimum Length 5").isLength({
      min: 5,
    }),
    body("key", "Key should be of minimum Length 3").isLength({
      min: 3,
    }),
    body("env", "Env should be of minimum Length 2").isLength({ min: 2 }),
  ],

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(500).json({
          message: "Error in creating ResourceModel",
          errors: errors, // MongoDB default ID
        });
      }

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
  },
);

module.exports = router;
