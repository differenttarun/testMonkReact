const express = require("express");
const AppModel = require("../models/AppModel");
const router = express.Router();

const { body, validationResult } = require("express-validator");

// ROUTE 1  create App Model
router.post(
  "/create",

  [
    body("modelName", "Model Name should be of minimum Lenth 4").isLength({
      min: 4,
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

// ROUTE 2: get All appModels case
router.get("/fetchAll", async (req, res) => {
  try {
    const appModels = await AppModel.find();

    return res.json(appModels);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching appModels",
      error: error.message,
    });
  }
});

// ROUTE 3: get AppModel by modelName
router.get("/fetchByModelName/:model", async (req, res) => {
  try {
    const { model } = req.params;

    const appModels = await AppModel.find({
      modelName: model,
    });

    if (appModels.length === 0) {
      return res.status(404).json({
        message: "AppModel with modelname " + model + " not found",
      });
    }

    res.status(200).json(appModels);
  } catch (error) {
    console.error("Error fetching AppModel:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ROUTE 3: get AppModel by modelName
router.get("/fetchByModelNameAndEnv/:model/:env", async (req, res) => {
  try {
    const { model, env } = req.params;

    const appModels = await AppModel.find({
      modelName: model,
      env: env,
    });

    if (appModels.length === 0) {
      return res.status(404).json({
        message: "AppModel with modelname " + model + " not found",
      });
    }

    res.status(200).json(appModels);
  } catch (error) {
    console.error("Error fetching AppModel:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
