const mongoose = require("mongoose");
const { Schema } = mongoose;

const getNextSequence = require("../utils/getNextSequence");

const testScriptSchema = Schema({
  testScriptId: {
    type: Number,
  },
  testScriptName: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate testCaseId
testScriptSchema.pre("save", async function () {
  if (this.isNew && !this.testScriptId) {
    this.testScriptId = await getNextSequence("testScript");
  }
});

module.exports = mongoose.model("testScript", testScriptSchema);
