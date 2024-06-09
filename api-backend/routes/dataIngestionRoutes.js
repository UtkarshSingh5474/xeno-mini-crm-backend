const express = require('express');
const router = express.Router();
const { ingestCustomerData, ingestOrderData } = require('../controllers/dataIngestionController');

router.post('/customers', ingestCustomerData);
router.post('/orders', ingestOrderData);

module.exports = router;
