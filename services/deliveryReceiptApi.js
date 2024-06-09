const { publishToQueue } = require('./pubsubService');

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

module.exports = { deliveryApiService };
