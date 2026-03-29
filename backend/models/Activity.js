const mongoose = require("mongoose");
const { Schema } = mongoose;

const getNextSequence = require("../utils/getNextSequence");

const activitySchema = Schema({
  activityId: {
    type: Number,
  },
  activityName: {
    type: String,
    required: true,
  },
  testScriptId: {
    type: Number,
  },
  library: {
    type: String,
    required: true,
  },
  function: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  set: {
    type: String,
  },
  use: {
    type: String,
  },

  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate testCaseId
activitySchema.pre("save", async function () {
  if (this.isNew && !this.activityId) {
    this.activityId = await getNextSequence("activity");
  }
});

module.exports = mongoose.model("activity", activitySchema);
