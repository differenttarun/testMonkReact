const mongoose = require("mongoose");
const { Schema } = mongoose;

const getNextSequence = require("../utils/getNextSequence");

const resourceModelSchema = Schema({
  resourceModelId: {
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
  env: {
    type: String,
    required: true,
  },
});

resourceModelSchema.index({ modelName: 1, key: 1, env: 1 }, { unique: true });

// Auto-generate scriptModelId
resourceModelSchema.pre("save", async function () {
  if (this.isNew && !this.resourceModelId) {
    this.resourceModelId = await getNextSequence("resourceModel");
  }
});

module.exports = mongoose.model("resourceModel", resourceModelSchema);
