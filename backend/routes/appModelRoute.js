const express = require("express");
const AppModel = require("../models/AppModel");
const router = express.Router();

const { body, validationResult } = require("express-validator");

// Sample route
router.post(
  "/create",

  [
    body("modelName", "Model Name should be of minimum Lenth 5").isLength({
      min: 5,
    }),
    body("key", "Key should be of minimum Lenth 3").isLength({ min: 3 }),
  ],

  async (req, res) => {
    try {
      // check if all validaitions passed
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(500).json({
          message: "Error in creating AppModel",
          errors: errors, // MongoDB default ID
        });
      }

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
  },
);

module.exports = router;
