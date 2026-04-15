const express = require("express");
const Activity = require("../models/Activity");
const router = express.Router();

// ROUTE 1: create test script
router.post("/create", async (req, res) => {
  try {
    // =========================
    // 1. CLEAN INPUT (VERY IMPORTANT)
    //    Remove any frontend-sent _id
    // =========================
    const { _id, ...cleanBody } = req.body;

    const activity = new Activity(cleanBody);

    const savedActivity = await activity.save();

    return res.status(201).json({
      message: "Activity created successfully",

      // ✅ return identifiers
      id: savedActivity.activityId,
      _id: savedActivity._id,

      // ✅ return full object for UI sync
      activity: savedActivity,
    });
  } catch (err) {
    console.error("Error while creating activity:", err);

    return res.status(500).json({
      message: "Error while creating activity",
      error: err.message,
    });
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
    }).sort({ actOrder: 1 }); // 🔥 ascending order

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
    const id = req.params.id;

    const updated = await Activity.findOneAndUpdate(
      { _id: id },
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

router.put("/reorder", async (req, res) => {
  try {
    const updates = req.body;

    const bulkOps = updates.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { actOrder: item.actOrder } },
      },
    }));

    await Activity.bulkWrite(bulkOps);

    res.json({ message: "Order updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/vi/activity/updateOrder
router.put("/updateOrder", async (req, res) => {
  try {
    const { activities } = req.body;

    // =========================
    // 1. VALIDATION
    // =========================
    if (!Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({
        message: "Activities array is required",
      });
    }

    // ensure all have _id + actOrder
    for (const a of activities) {
      if (!a._id || typeof a.actOrder !== "number") {
        return res.status(400).json({
          message: "Each activity must have _id and actOrder",
        });
      }
    }

    // =========================
    // 2. BULK UPDATE
    // =========================
    const bulkOps = activities.map((a) => ({
      updateOne: {
        filter: { _id: a._id },
        update: { $set: { actOrder: a.actOrder } },
      },
    }));

    const result = await Activity.bulkWrite(bulkOps);

    // =========================
    // 3. RESPONSE
    // =========================
    res.json({
      message: "Order updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Update order error:", err);
    res.status(500).json({
      message: "Failed to update order",
      error: err.message,
    });
  }
});
module.exports = router;
