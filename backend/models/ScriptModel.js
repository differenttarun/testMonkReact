const mongoose = require("mongoose");
const { Schema } = mongoose;

const getNextSequence = require("../utils/getNextSequence");

const scriptModelSchema = Schema({
  scriptModelId: {
    type: Number,
  },
  scriptModelName: {
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

scriptModelSchema.index({ scriptModelName: 1, key: 1 }, { unique: true });

// Auto-generate scriptModelId
scriptModelSchema.pre("save", async function () {
  if (this.isNew && !this.scriptModelId) {
    this.scriptModelId = await getNextSequence("scriptModel");
  }
});

module.exports = mongoose.model("scriptModel", scriptModelSchema);
