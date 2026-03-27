const mongoose = require("mongoose");
const { Schema } = mongoose;

const getNextSequence = require("../utils/getNextSequence");

const testSuiteTestCaseSchema = Schema({
  testSuiteTestCaseId: {
    type: Number,
    unique: true,
    required: true,
  },
  suiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TestSuite",
    required: true,
  },

  testCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TestCase",
    required: true,
  },
  env: {
    type: String,
    required: true,
  },
});

// Auto-generate testCaseId
testCaseSchema.pre("save", async function (next) {
  if (!this.testCaseId) {
    this.testCaseId = await getNextSequence("testcase");
  }
  next();
});

module.exports = mongoose.model(
  "testSuiteTestCaseSchema",
  testSuiteTestCaseSchema,
);
