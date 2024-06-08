const express = require('express');
const router = express.Router();
const { testDBConnection, getDefaultResponse } = require('../controllers/testController');

// Default route for /api
router.get('/', getDefaultResponse);

// Test route for /api/test
router.get('/test', testDBConnection);

module.exports = router;
