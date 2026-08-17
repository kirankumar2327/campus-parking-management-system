const ParkingZone = require("../models/ParkingZone");
const ParkingSlot = require("../models/ParkingSlot");
const Reservation = require("../models/Reservation");

const createZone = async (req, res) => {
  try {
    const zone = await ParkingZone.create(req.body);
    res.status(201).json({
      message: "Parking zone created",
      zone,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getAdminZones = async (req, res) => {
  try {
    const zones = await ParkingZone.find().sort({ createdAt: 1 });
    res.json({ zones });
  } catch (error) {
    console.error("Get admin zones error:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateZone = async (req, res) => {
  try {
    const zone = await ParkingZone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!zone) {
      return res.status(404).json({
        message: "Parking zone not found",
      });
    }

    res.json({
      message: "Parking zone updated",
      zone,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const createSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.create(req.body);

    const populatedSlot = await ParkingSlot.findById(slot._id)
      .populate("zone", "name location");

    res.status(201).json({
      message: "Parking slot created",
      slot: populatedSlot,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getStatistics = async (req, res) => {
  try {
    const [
      totalZones,
      totalSlots,
      availableSlots,
      activeReservations,
      totalReservations,
    ] = await Promise.all([
      ParkingZone.countDocuments(),
      ParkingSlot.countDocuments(),
      ParkingSlot.countDocuments({ isAvailable: true }),
      Reservation.countDocuments({ status: "active" }),
      Reservation.countDocuments(),
    ]);

    const zoneUsage = await Reservation.aggregate([
      {
        $group: {
          _id: "$zone",
          reservations: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "parkingzones",
          localField: "_id",
          foreignField: "_id",
          as: "zone",
        },
      },
      {
        $project: {
          _id: 0,
          zoneName: { $arrayElemAt: ["$zone.name", 0] },
          reservations: 1,
        },
      },
    ]);

    res.json({
      statistics: {
        totalZones,
        totalSlots,
        availableSlots,
        occupiedSlots: totalSlots - availableSlots,
        activeReservations,
        totalReservations,
      },
      zoneUsage,
    });
  } catch (error) {
    console.error("Get statistics error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const getReports = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("user", "name email")
      .populate("slot", "slotNumber")
      .populate("zone", "name")
      .sort({ createdAt: -1 });

    const reports = reservations.map((reservation) => ({
      user: reservation.user?.name || "Unknown",
      email: reservation.user?.email || "Unknown",
      zone: reservation.zone?.name || "Unknown",
      slot: reservation.slot?.slotNumber || "Unknown",
      permitCode: reservation.permitCode,
      vehicleNumber: reservation.vehicleNumber,
      status: reservation.status,
      startsAt: reservation.startsAt,
      expiresAt: reservation.expiresAt,
    }));

    res.json({
      generatedAt: new Date(),
      reports,
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createZone,
  getAdminZones,
  updateZone,
  createSlot,
  getStatistics,
  getReports,
};