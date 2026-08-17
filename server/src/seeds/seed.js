require("dotenv").config();
const connectDb = require("../config/db");
const User = require("../models/User");
const ParkingZone = require("../models/ParkingZone");
const ParkingSlot = require("../models/ParkingSlot");
const Reservation = require("../models/Reservation");

const zoneConfigs = [
  {
    name: "SAC",
    location: "SAC",
    description: "Student Activity Centre parking zone",
    prefix: "SAC",
  },
  {
    name: "NLHC",
    location: "NLHC",
    description: "NLHC campus parking zone",
    prefix: "NLHC",
  },
  {
    name: "Central Library",
    location: "Central Library",
    description: "Parking area near the Central Library",
    prefix: "CL",
  },
  {
    name: "NAC",
    location: "NAC",
    description: "NAC building parking zone",
    prefix: "NAC",
  },
  {
    name: "CSE Department",
    location: "CSE Department",
    description: "Computer Science department parking zone",
    prefix: "CSE",
  },
  {
    name: "Health Centre",
    location: "Health Centre",
    description: "Parking zone for the Health Centre",
    prefix: "HC",
  },
  {
    name: "I2H",
    location: "I2H",
    description: "I2H block parking zone",
    prefix: "I2H",
  },
  {
    name: "Main Gate",
    location: "Main Gate",
    description: "Parking zone near the Main Gate",
    prefix: "MG",
  },
  {
    name: "Academic Complex",
    location: "Academic Complex",
    description: "Academic Complex parking zone",
    prefix: "AC",
  },
  {
    name: "Amber",
    location: "Amber",
    description: "Amber hostel parking zone",
    prefix: "AMB",
  },
  {
    name: "Aquamarine",
    location: "Aquamarine",
    description: "Aquamarine hostel parking zone",
    prefix: "AQM",
  },
  {
    name: "Mechanical Department",
    location: "Mechanical Department",
    description: "Mechanical department parking zone",
    prefix: "ME",
  },
  {
    name: "Enviro Department",
    location: "Enviro Department",
    description: "Environmental department parking zone",
    prefix: "ENV",
  },
  {
    name: "OAT",
    location: "OAT",
    description: "Open Air Theatre parking zone",
    prefix: "OAT",
  },
];

const seed = async () => {
  try {
    await connectDb();

    await Promise.all([
      User.deleteMany({}),
      ParkingZone.deleteMany({}),
      ParkingSlot.deleteMany({}),
      Reservation.deleteMany({}),
    ]);

    const users = [];
    users.push(
      await User.create({
        name: "Aarav Student",
        email: "user@campus.com",
        password: "password123",
        role: "user",
        vehicleNumber: "JH10AB1234",
        department: "Computer Science",
      })
    );
    users.push(
      await User.create({
        name: "Nisha Guard",
        email: "security@campus.com",
        password: "password123",
        role: "security",
        vehicleNumber: "",
        department: "Security",
      })
    );
    users.push(
      await User.create({
        name: "Admin Office",
        email: "admin@campus.com",
        password: "password123",
        role: "admin",
        vehicleNumber: "",
        department: "Administration",
      })
    );

    const zones = await ParkingZone.insertMany(
      zoneConfigs.map(({ name, location, description }) => ({
        name,
        location,
        description,
      }))
    );

    const slotData = zones.flatMap((zone, zoneIndex) => {
      const prefix = zoneConfigs[zoneIndex].prefix;

      return Array.from({ length: 10 }, (_, index) => ({
        slotNumber: `${prefix}-${String(index + 1).padStart(2, "0")}`,
        vehicleType: "four-wheeler",
        isAvailable: true,
        zone: zone._id,
      }));
    });

    await ParkingSlot.insertMany(slotData);

    console.log("Seed completed");
    console.log(`Zones created: ${zones.length}`);
    console.log(`Slots created: ${slotData.length}`);
    console.log("User login: user@campus.com / password123");
    console.log("Security login: security@campus.com / password123");
    console.log("Admin login: admin@campus.com / password123");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seed();
