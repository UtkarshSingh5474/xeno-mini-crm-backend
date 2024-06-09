const { getDB } = require("../config/db");
const { publishToQueue } = require("../services/pubsubService");
const Customer = require("../models/customer");
const Order = require("../models/order");
const mongoose = require("mongoose");

const ingestCustomerData = async (req, res) => {
  try {
    const customerData = req.body;
    const customer = new Customer(customerData);

    await customer.validate();

    await publishToQueue({ type: "customer", data: customerData });

    res.status(200).send("Customer data received");
  } catch (error) {
    res.status(400).send(`Validation error: ${error.message}`);
  }
};

const ingestOrderData = async (req, res) => {
  try {
    const orderData = req.body;
    const order = new Order(orderData);

    await order.validate();

    const customerId = new mongoose.Types.ObjectId(orderData.customer_id);

    const db = getDB();
    const customer = await db
      .collection("customers")
      .findOne({ _id: customerId });
    if (!customer) {
      return res.status(400).send("Customer not found");
    }

    await publishToQueue({ type: "order", data: orderData });

    res.status(200).send("Order data received");
  } catch (error) {
    res.status(400).send(`Validation error: ${error.message}`);
  }
};

module.exports = { ingestCustomerData, ingestOrderData };
