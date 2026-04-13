const express = require("express");
const ResourceModel = require("../models/ResourceModel");
const router = express.Router();
const { body, validationResult } = require("express-validator");

// ROUTE 1  create Resource Model
router.post(
  "/create",
  [
    body("modelName", "Model Name should be of minimum Length 4").isLength({
      min: 4,
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

// ROUTE 2: get All appModels case
router.get("/fetchAll", async (req, res) => {
  try {
    const resourceModels = await ResourceModel.find();

    return res.json(resourceModels);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching resourceModels",
      error: error.message,
    });
  }
});

// ROUTE 3: get ResourceModels by modelName
router.get("/fetchByModelName/:model", async (req, res) => {
  try {
    const { model } = req.params;

    const resourceModels = await ResourceModel.find({
      modelName: model,
    });

    if (resourceModels.length === 0) {
      return res.status(404).json({
        message: "ResourceModel with modelname " + model + " not found",
      });
    }

    res.status(200).json(resourceModels);
  } catch (error) {
    console.error("Error fetching AppModel:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ROUTE 3: get ResourceModels by modelName
router.get("/fetchByModelNameAndEnv/:model/:env", async (req, res) => {
  try {
    const { model, env } = req.params;

    const resourceModels = await ResourceModel.find({
      modelName: model,
      env: env,
    });

    if (resourceModels.length === 0) {
      return res.status(404).json({
        message:
          "ResourceModel with modelname " +
          model +
          " and env " +
          env +
          " not found",
      });
    }

    res.status(200).json(resourceModels);
  } catch (error) {
    console.error("Error fetching ResourceModel:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const updated = await ResourceModel.findOneAndUpdate(
      { resourceModelId: id },
      { $set: req.body },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({
        message: "Resource Model not found",
      });
    }

    res.json({
      message: "Resource Model updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error updating Resource Model",
    });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const deleted = await ResourceModel.findOneAndDelete({
      resourceModelId: id,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Resource Model not found",
      });
    }

    res.json({
      message: "Resource Model deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error deleting Resource Model",
    });
  }
});
module.exports = router;
