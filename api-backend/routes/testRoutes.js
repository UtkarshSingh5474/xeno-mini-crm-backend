const express = require("express");
const router = express.Router();
const {
  testDBConnection,
  getDefaultResponse,
} = require("../controllers/testController");

router.get("/", getDefaultResponse);

router.get("/test", testDBConnection);

module.exports = router;
