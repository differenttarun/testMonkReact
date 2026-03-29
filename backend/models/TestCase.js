const mongoose = require("mongoose");
const { Schema } = mongoose;

const getNextSequence = require("../utils/getNextSequence");

const testCaseSchema = Schema({
  testCaseId: {
    type: Number,
  },
  testCaseName: {
    type: String,
    required: true,
  },
  testScriptId: {
    type: Number,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate testCaseId
testCaseSchema.pre("save", async function () {
  if (this.isNew && !this.testCaseId) {
    this.testCaseId = await getNextSequence("testcase");
  }
});

module.exports = mongoose.model("testCase", testCaseSchema);
