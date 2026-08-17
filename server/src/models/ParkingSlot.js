const mongoose = require("mongoose");

const parkingSlotSchema = new mongoose.Schema(
  {
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingZone",
      required: true,
    },
    slotNumber: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ["two-wheeler", "four-wheeler", "visitor", "ev"],
      default: "four-wheeler",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

parkingSlotSchema.index({ zone: 1, slotNumber: 1 }, { unique: true });

module.exports = mongoose.model("ParkingSlot", parkingSlotSchema);
