const mongoose = require("mongoose");

const filesSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("file", filesSchema);
