const mongoose = require('mongoose');
const {Schema}  = mongoose;

const getNextSequence = require("../utils/getNextSequence");

const testCaseSchema = Schema({
  testCaseId: {
    type: Number,
    unique: true,
    required: true
  },
  testCaseName: {
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
    this.testCaseId = await getNextSequence("testcase");
  }
  next();
});

module.exports = mongoose.model("testCase", testCaseSchema);