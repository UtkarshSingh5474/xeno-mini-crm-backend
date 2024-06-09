const axios = require("axios");
const { publishToQueue } = require("./pubsubService");
const { deliveryApiService } = require("./deliveryReceiptApi");

const sendToVendorAPI = async (message, communicationId, customerId) => {
  try {
    const status = Math.random() < 0.9 ? "SENT" : "FAILED";
    console.log("Message sent to vendor API:", message, "Status:", status);

    await deliveryApiService(communicationId, customerId, status);

    return { status };
  } catch (error) {
    console.error("Error sending message to vendor API", error);

    await deliveryApiService(communicationId, customerId, "FAILED");

    return { status: "FAILED" };
  }
};

module.exports = { sendToVendorAPI };
