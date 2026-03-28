const mongoose = require("mongoose");
const { Schema } = mongoose;

const getNextSequence = require("../utils/getNextSequence");

const appModelSchema = Schema({
  appModelId: {
    type: Number,
  },
  modelName: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  key: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});

appModelSchema.index({ modelName: 1, key: 1 }, { unique: true });

// Auto-generate scriptModelId
appModelSchema.pre("save", async function () {
  if (this.isNew && !this.appModelId) {
    this.appModelId = await getNextSequence("appModel");
  }
});

module.exports = mongoose.model("appModel", appModelSchema);
