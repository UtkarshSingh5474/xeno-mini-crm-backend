const axios = require('axios');
const { publishToQueue } = require('../services/pubsubService');

const sendToVendorAPI = async (message, communicationId, customerId) => {
  try {
    // Simulate the response from a vendor API
    const status = Math.random() < 0.9 ? 'SENT' : 'FAILED';
    console.log('Message sent to vendor API:', message, "Status:", status);

    // Call deliveryApiService to handle delivery receipt
    await deliveryApiService(communicationId, customerId, status);

    return { status };
  } catch (error) {
    console.error('Error sending message to vendor API', error);

    // Call deliveryApiService with FAILED status if there's an error
    await deliveryApiService(communicationId, customerId, 'FAILED');

    return { status: 'FAILED' };
  }
};

const deliveryApiService = async (communicationId, customerId, status) => {
  await publishToQueue({
    type: 'deliveryReceipt',
    data: {
      communicationId,
      customerId,
      status
    }
  });
};

module.exports = { sendToVendorAPI };
