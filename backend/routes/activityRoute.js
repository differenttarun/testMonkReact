const express = require("express");
const Activity = require("../models/Activity");
const router = express.Router();

// ROUTE 1: create test script
router.post("/create", async (req, res) => {
  try {
    const activity = Activity(req.body);
    await activity.save();
    return res.json({
      message: "Activity created successfully",
      id: activity.activityId, // auto-generated ID
      _id: activity._id, // MongoDB default ID
    });
  } catch (err) {
    console.error("Error while Generating activity:  " + err);
  }
});

// ROUTE 2: get All test script
router.get("/fetchAllActivities", async (req, res) => {
  try {
    const activities = await Activity.find();

    return res.json(activities);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching test activities",
      error: error.message,
    });
  }
});

// ROUTE 3: get test case by id
router.get("/fetchActivityById/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findOne({
      activityId: req.params.id,
    });

    if (!activity) {
      return res
        .status(404)
        .json({ message: "Activity with id " + id + " not found " });
    }

    res.status(200).json(testScript);
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ROUTE 3: get test case by id
router.get("/fetchActivityByTestScriptId/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const activities = await Activity.find({
      testScriptId: req.params.id,
    });

    if (!activities) {
      return res
        .status(404)
        .json({ message: "Activity with testScriptId " + id + " not found " });
    }

    const ts = {
      scriptId: id,
      scriptName: "todo",
      activityList: activities,
    };
    res.status(200).json(ts);
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const updated = await Activity.findOneAndUpdate(
      { activityId: id },
      { $set: req.body },
      { returnDocument: "after" }, // ✅ NEW way
    );

    if (!updated) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    res.json({
      message: "Activity updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error updating activity",
    });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id; // ⚠️ keep as string (ObjectId)

    const deleted = await Activity.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    res.json({
      message: "Activity deleted successfully",
      data: deleted,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error deleting activity",
    });
  }
});
module.exports = router;
