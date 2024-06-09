const express = require("express");
const router = express.Router();
const { getAudienceSize } = require("../controllers/audienceController");

router.post("/size", getAudienceSize);

module.exports = router;
