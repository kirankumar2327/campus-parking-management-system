const ParkingSlot = require("../models/ParkingSlot");
const ParkingZone = require("../models/ParkingZone");
const Reservation = require("../models/Reservation");
const { createPermitCode } = require("../utils/permit");
const { processReservationAlerts } = require("../services/reservationAlertService");

const refreshExpiredReservations = async () => {
  await processReservationAlerts();
};

const getDurationMinutes = (durationHours, durationMinutes) => {
  const hours = Math.max(0, Number(durationHours || 0));
  const minutes = Math.max(0, Number(durationMinutes || 0));

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    throw new Error("Duration must be numeric");
  }

  const totalMinutes = Math.round(hours * 60 + minutes);

  if (totalMinutes < 10) {
    throw new Error("Minimum reservation duration is 10 minutes");
  }

  if (totalMinutes > 12 * 60) {
    throw new Error("Maximum reservation duration is 12 hours");
  }

  return totalMinutes;
};

const getSlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find()
      .populate("zone", "name location")
      .sort({ createdAt: 1 });

    res.json({ slots });
  } catch (error) {
    console.error("Get slots error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getZones = async (req, res) => {
  const zones = await ParkingZone.find().sort({ createdAt: 1 });
  res.json({ zones });
};

const reserveSlot = async (req, res) => {
  try {
    

    const { slotId, vehicleNumber, durationHours, durationMinutes } = req.body;
    const slot = await ParkingSlot.findById(slotId).populate("zone");

    if (!slot) {
      return res.status(404).json({ message: "Parking slot not found" });
    }

    if (!slot.isAvailable) {
      return res.status(400).json({ message: "Parking slot is not available" });
    }

    const startsAt = new Date();
    const totalDurationMinutes = getDurationMinutes(durationHours, durationMinutes);
    const expiresAt = new Date(startsAt.getTime() + totalDurationMinutes * 60 * 1000);

    const reservation = await Reservation.create({
      user: req.user._id,
      slot: slot._id,
      zone: slot.zone._id,
      vehicleNumber: vehicleNumber || req.user.vehicleNumber || "NA",
      startsAt,
      expiresAt,
      permitCode: createPermitCode(),
    });

    slot.isAvailable = false;
    await slot.save();

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate("slot", "slotNumber vehicleType")
      .populate("zone", "name location")
      .populate("user", "name email");

    res.status(201).json({
      message: "Parking slot reserved successfully",
      reservation: populatedReservation,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate("slot", "slotNumber vehicleType")
      .populate("zone", "name location")
      .sort({ createdAt: -1 });

    const now = new Date();

    const notifications = reservations
      .filter(
        (reservation) =>
          reservation.status === "active" &&
          reservation.expiresAt.getTime() - now.getTime() <= 30 * 60 * 1000
      )
      .map((reservation) => ({
        reservationId: reservation._id,
        message: `Reservation ${reservation.permitCode} expires soon`,
        expiresAt: reservation.expiresAt,
      }));

    res.json({ reservations, notifications });
  } catch (error) {
    console.error("Get reservations error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getActiveReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ status: "active" })
      .populate("user", "name email vehicleNumber")
      .populate("slot", "slotNumber vehicleType")
      .populate("zone", "name location")
      .sort({ expiresAt: 1 });

    res.json({ reservations });
  } catch (error) {
    console.error("Get active reservations error:", error);
    res.status(500).json({ message: error.message });
  }
};

const verifyPermit = async (req, res) => {
  try {
    const { permitCode } = req.body;
    

    const reservation = await Reservation.findOne({ permitCode })
      .populate("user", "name email vehicleNumber")
      .populate("slot", "slotNumber vehicleType")
      .populate("zone", "name location");

    if (!reservation) {
      return res.status(404).json({ message: "Permit not found" });
    }

    const isValid = reservation.status === "active" && reservation.expiresAt > new Date();

    if (isValid) {
      reservation.verifiedAt = new Date();
      reservation.verifiedBy = req.user._id;
      await reservation.save();
    }

    res.json({
      valid: isValid,
      reservation,
      message: isValid ? "Permit verified successfully" : "Permit is not valid",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSlotAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const slot = await ParkingSlot.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      { new: true }
    ).populate("zone", "name location");

    if (!slot) {
      return res.status(404).json({ message: "Parking slot not found" });
    }

    res.json({ message: "Slot availability updated", slot });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getSlots,
  getZones,
  reserveSlot,
  getMyReservations,
  getActiveReservations,
  verifyPermit,
  updateSlotAvailability,
  refreshExpiredReservations,
};
