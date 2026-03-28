const express = require("express");
const ScriptModel = require("../models/ScriptModel");
const router = express.Router();
const { body, validationResult } = require("express-validator");
// Sample route
router.post(
  "/create",
  [
    body("modelName", "Model Name should be of minimum Length 5").isLength({
      min: 5,
    }),
    body("key", "key should be of minimum Length 3").isLength({
      min: 3,
    }),
    body("value", "Value should not be empty").isLength({ min: 1 }),
  ],

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(500).json({
          message: "Error in creating ScriptModel",
          errors, // MongoDB default ID
        });
      }
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
  },
);

module.exports = router;
