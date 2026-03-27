const mongoose = require('mongoose');
const {Schema}  = mongoose;

const getNextSequence = require("../utils/getNextSequence");

const testSuiteSchema = Schema({
  testSuiteId: {
    type: Number,
    unique: true,
    required: true
  },
  testSuiteName: {
    type: String,
    required: true
  },
  createdDate :{
    type: Date,
    default: Date.now

  }

});

// Auto-generate testCaseId
testCaseSchema.pre("save", async function(next) {
  if (!this.testCaseId) {
    this.testCaseId = await getNextSequence("testSuite");
  }
  next();
});

module.exports = mongoose.model("testSuite", testSuiteSchema);