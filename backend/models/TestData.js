const mongoose = require("mongoose");
const { Schema } = mongoose;

const getNextSequence = require("../utils/getNextSequence");

const testDataSchema = Schema({
  testDataId: {
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
  key: {
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

testDataSchema.index(
  { testCaseId: 1, env: 1, key: 1, value: 1 },
  { unique: true },
);

// Auto-generate testCaseId
testDataSchema.pre("save", async function () {
  if (this.isNew && !this.testDataId) {
    this.testDataId = await getNextSequence("testdata");
  }
});

module.exports = mongoose.model("testdata", testDataSchema);
