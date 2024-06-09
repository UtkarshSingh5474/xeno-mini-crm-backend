const { getDB } = require('../config/db');
const { publishToQueue } = require('../services/pubsubService');
const Customer = require('../models/customer');
const Order = require('../models/order');

const ingestCustomerData = async (req, res) => {
  try {
    const customerData = req.body;
    const customer = new Customer(customerData);

    // Validate customer data using Mongoose
    await customer.validate();

    // Publish validated data to queue
    await publishToQueue({ type: 'customer', data: customerData });

    res.status(200).send('Customer data received');
  } catch (error) {
    res.status(400).send(`Validation error: ${error.message}`);
  }
};

const ingestOrderData = async (req, res) => {
  try {
    const orderData = req.body;
    const order = new Order(orderData);

    // Validate order data using Mongoose
    await order.validate();

    // Check if customer exists
    const customer = await Customer.findById(order.customer_id);
    if (!customer) {
      return res.status(400).send('Customer not found');
    }

    // Publish validated data to queue
    await publishToQueue({ type: 'order', data: orderData });

    res.status(200).send('Order data received');
  } catch (error) {
    res.status(400).send(`Validation error: ${error.message}`);
  }
};

module.exports = { ingestCustomerData, ingestOrderData };
