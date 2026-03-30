const mongoose = require("mongoose");
const { Schema } = mongoose;

const getNextSequence = require("../utils/getNextSequence");

const expectedResultSchema = Schema({
  expectedResultId: {
    type: Number,
  },
  testCaseId: {
    type: Number,
    required: true,
  },
  env: {
    type: String,
    required: true,
  },
  activityName: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

expectedResultSchema.index(
  { testCaseId: 1, env: 1, activityName: 1, value: 1 },
  { unique: true },
);

// Auto-generate testCaseId
expectedResultSchema.pre("save", async function () {
  if (this.isNew && !this.expectedResultId) {
    this.expectedResultId = await getNextSequence("expectedResult");
  }
});

module.exports = mongoose.model("expectedResult", expectedResultSchema);
