const express = require("express");
const multer = require("multer");
const router = express.Router();

const {
  listComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  addStatusUpdate,
  submitFeedback,
  getStats,
} = require("../controllers/complaintController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/stats", requireAuth, requireAdmin, getStats);
router.get("/", requireAuth, listComplaints);
router.get("/:id", requireAuth, getComplaint);
router.post("/", requireAuth, upload.single("photo"), createComplaint);
router.put("/:id", requireAuth, requireAdmin, updateComplaint);
router.post("/:id/status", requireAuth, upload.single("photo"), addStatusUpdate);
router.post("/:id/feedback", requireAuth, submitFeedback);

module.exports = router;
