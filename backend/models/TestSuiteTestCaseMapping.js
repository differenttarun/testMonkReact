const mongoose = require("mongoose");
const { Schema } = mongoose;

const getNextSequence = require("../utils/getNextSequence");

const testSuiteTestCaseMappingSchema = Schema({
  testSuiteTestCaseMappingId: {
    type: Number,
  },
  testSuiteId: {
    type: Number,
    required: true,
  },

  testCaseId: {
    type: Number,
    required: true,
  },
  env: {
    type: String,
    required: true,
  },
});

testSuiteTestCaseMappingSchema.index(
  { testSuiteId: 1, testCaseId: 1, env: 1 },
  { unique: true },
);

// Auto-generate testSuiteId
testSuiteTestCaseMappingSchema.pre("save", async function () {
  if (this.isNew && !this.testSuiteTestCaseMappingId) {
    this.testSuiteTestCaseMappingId = await getNextSequence(
      "TestSuiteTestCaseMapping",
    );
  }
});

module.exports = mongoose.model(
  "TestSuiteTestCaseMapping",
  testSuiteTestCaseMappingSchema,
);
