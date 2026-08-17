const express = require("express");
const {
  createZone,
  getAdminZones,
  updateZone,
  createSlot,
  getStatistics,
  getReports,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

router.route("/zones").get(getAdminZones).post(createZone);
router.patch("/zones/:id", updateZone);
router.post("/slots", createSlot);
router.get("/statistics", getStatistics);
router.get("/reports", getReports);

module.exports = router;
