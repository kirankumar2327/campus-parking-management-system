const Reservation = require("../models/Reservation");
const ParkingSlot = require("../models/ParkingSlot");
const { sendEmail } = require("./emailService");

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const reminderWindowMinutes = () =>
  Number(process.env.EXPIRY_REMINDER_MINUTES || 30);

const loadReservations = (query) =>
  Reservation.find(query)
    .populate("user", "name email")
    .populate("slot", "slotNumber")
    .populate("zone", "name");

const buildReminderMessage = (reservation) => ({
  subject: `Parking reminder: Permit ${reservation.permitCode} expires soon`,
  text: [
    `Hello ${reservation.user?.name || "User"},`,
    "",
    `Your parking reservation for ${reservation.zone?.name || "Campus Zone"} / ${
      reservation.slot?.slotNumber || "Slot"
    } expires at ${formatDate(reservation.expiresAt)}.`,
    `Permit code: ${reservation.permitCode}`,
    `Vehicle number: ${reservation.vehicleNumber}`,
    "",
    "Please move your vehicle or arrange an updated reservation if needed.",
  ].join("\n"),
  html: `
    <p>Hello ${reservation.user?.name || "User"},</p>
    <p>Your parking reservation for <strong>${reservation.zone?.name || "Campus Zone"} / ${
      reservation.slot?.slotNumber || "Slot"
    }</strong> expires at <strong>${formatDate(reservation.expiresAt)}</strong>.</p>
    <p>Permit code: <strong>${reservation.permitCode}</strong><br />Vehicle number: <strong>${
      reservation.vehicleNumber
    }</strong></p>
    <p>Please move your vehicle or arrange an updated reservation if needed.</p>
  `,
});

const buildExpiredMessage = (reservation) => ({
  subject: `Parking expired: Permit ${reservation.permitCode} is no longer valid`,
  text: [
    `Hello ${reservation.user?.name || "User"},`,
    "",
    `Your parking reservation for ${reservation.zone?.name || "Campus Zone"} / ${
      reservation.slot?.slotNumber || "Slot"
    } expired at ${formatDate(reservation.expiresAt)}.`,
    `Permit code: ${reservation.permitCode}`,
    "",
    "This permit is no longer valid for campus parking access.",
  ].join("\n"),
  html: `
    <p>Hello ${reservation.user?.name || "User"},</p>
    <p>Your parking reservation for <strong>${reservation.zone?.name || "Campus Zone"} / ${
      reservation.slot?.slotNumber || "Slot"
    }</strong> expired at <strong>${formatDate(reservation.expiresAt)}</strong>.</p>
    <p>Permit code: <strong>${reservation.permitCode}</strong></p>
    <p>This permit is no longer valid for campus parking access.</p>
  `,
});

const sendUpcomingExpiryReminders = async () => {
  const now = new Date();
  const reminderCutoff = new Date(
    now.getTime() + reminderWindowMinutes() * 60 * 1000
  );

  const reservations = await loadReservations({
    status: "active",
    reminderSentAt: null,
    expiresAt: {
      $gt: now,
      $lte: reminderCutoff,
    },
  });

  for (const reservation of reservations) {
    if (!reservation.user?.email) {
      continue;
    }

    const sent = await sendEmail({
      to: reservation.user.email,
      ...buildReminderMessage(reservation),
    });

    if (sent) {
      reservation.reminderSentAt = new Date();
      await reservation.save();
    }
  }
};

const expireReservationsAndNotify = async () => {
  const now = new Date();
  const reservations = await loadReservations({
    status: "active",
    expiresAt: { $lte: now },
  });

  for (const reservation of reservations) {
    if (reservation.user?.email && !reservation.expiryEmailSentAt) {
      const sent = await sendEmail({
        to: reservation.user.email,
        ...buildExpiredMessage(reservation),
      });

      if (sent) {
        reservation.expiryEmailSentAt = new Date();
      }
    }

    reservation.status = "expired";
    await reservation.save();
    await ParkingSlot.findByIdAndUpdate(reservation.slot?._id || reservation.slot, {
      isAvailable: true,
    });
  }
};

const processReservationAlerts = async () => {
  await sendUpcomingExpiryReminders();
  await expireReservationsAndNotify();
};

module.exports = { processReservationAlerts };
