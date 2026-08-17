const QRCode = require("qrcode");
const Reservation = require("../models/Reservation");

const getReservationQr = async (req, res) => {
  const reservation = await Reservation.findById(req.params.id)
    .populate("slot", "slotNumber")
    .populate("zone", "name")
    .populate("user", "name email");

  if (!reservation) {
    return res.status(404).json({ message: "Reservation not found" });
  }

  if (reservation.user._id.toString() !== req.user._id.toString() && req.user.role === "user") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const payload = JSON.stringify({
    permitCode: reservation.permitCode,
    reservationId: reservation._id,
    zone: reservation.zone?.name,
    slot: reservation.slot?.slotNumber,
    expiresAt: reservation.expiresAt,
  });

  const qrDataUrl = await QRCode.toDataURL(payload);
  res.json({ qrDataUrl, payload });
};

module.exports = { getReservationQr };
