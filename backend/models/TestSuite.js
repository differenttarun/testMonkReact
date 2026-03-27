const mongoose = require("mongoose");
const { Schema } = mongoose;

const getNextSequence = require("../utils/getNextSequence");

const testSuiteSchema = Schema({
  testSuiteId: {
    type: Number,
  },
  testSuiteName: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate testSuiteId
testSuiteSchema.pre("save", async function () {
  if (this.isNew && !this.testSuiteId) {
    this.testSuiteId = await getNextSequence("testSuite");
  }
});

module.exports = mongoose.model("testSuite", testSuiteSchema);
