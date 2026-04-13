const express = require("express");
const ScriptModel = require("../models/ScriptModel");
const router = express.Router();
const { body, validationResult } = require("express-validator");
// ROUTE 1: create Script Model
router.post(
  "/create",
  [
    body("modelName", "Model Name should be of minimum Length 4").isLength({
      min: 4,
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

// ROUTE 2: get All Script models case
router.get("/fetchAll", async (req, res) => {
  try {
    const scriptModels = await ScriptModel.find();

    return res.json(scriptModels);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching scriptModels",
      error: error.message,
    });
  }
});

// ROUTE 3: get scriptModel case modelName
router.get("/fetchByModelName/:model", async (req, res) => {
  try {
    const { model } = req.params;

    const scriptModels = await ScriptModel.find({
      modelName: model,
    });

    console.log("Count:", scriptModels.length);
    if (scriptModels.length === 0) {
      return res.status(404).json({
        message: "ScriptModels with modelname " + model + " not found",
      });
    }

    res.status(200).json(scriptModels);
  } catch (error) {
    console.error("Error fetching ScriptModels:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const updated = await ScriptModel.findOneAndUpdate(
      { scriptModelId: Number(req.params.id) },
      { $set: req.body },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({
        message: "Script Model not found",
      });
    }

    res.json({
      message: "Updated successfully",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating Script Model" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const deleted = await ScriptModel.findOneAndDelete({
      scriptModelId: Number(req.params.id),
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Script Model not found",
      });
    }

    res.json({
      message: "Deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Error deleting Script Model" });
  }
});

module.exports = router;
