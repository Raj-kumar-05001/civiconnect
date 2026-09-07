const express = require("express");
const router = express.Router();
const { listCategories, createCategory } = require("../controllers/categoryController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

router.get("/", listCategories);
router.post("/", requireAuth, requireAdmin, createCategory);

module.exports = router;
