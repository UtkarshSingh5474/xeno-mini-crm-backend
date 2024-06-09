require('dotenv').config();
const { connectDB, getDB } = require('./config/db');
const { consumeQueue, publishToQueue } = require('./services/pubsubService');
const { sendToVendorAPI } = require('./services/vendorApi');
const { ObjectId } = require('mongodb'); // Import ObjectId

const startConsumer = async () => {
  await connectDB();
  consumeQueue(async (message) => {
    const db = getDB();
    try {
      if (message.type === 'campaignMessage') {
        const response = await sendToVendorAPI(message.data.message, message.data.communicationId, message.data.customerId);
        await publishToQueue({
          type: 'deliveryReceipt',
          data: {
            communicationId: message.data.communicationId,
            customerId: message.data.customerId,
            status: response.status
          }
        });
      } else if (message.type === 'deliveryReceipt') {
        const updateField = message.data.status === 'SENT' ? { sentCount: 1 } : { failedCount: 1 };
        await db.collection('communication_log').updateOne(
          { _id: new ObjectId(message.data.communicationId) }, // Use new ObjectId here
          { $inc: updateField }
        );
        
        // Update overall status
        const communicationLog = await db.collection('communication_log').findOne({ _id: new ObjectId(message.data.communicationId) }); // Use new ObjectId here
        if (!communicationLog) {
          console.error(`Communication log not found for id: ${message.data.communicationId}`);
          return;
        }

        if (communicationLog.audienceSize === communicationLog.sentCount + communicationLog.failedCount) {
          const overallStatus = communicationLog.sentCount === communicationLog.audienceSize ? 'Completed' : 'Failed';
          await db.collection('communication_log').updateOne(
            { _id: new ObjectId(message.data.communicationId) }, // Use new ObjectId here
            { $set: { deliveryStatus: overallStatus } }
          );
        }
      } else if (message.type === 'customer') {
        await db.collection('customers').insertOne(message.data);
      } else if (message.type === 'order') {
        const orderData = message.data;
        await db.collection('orders').insertOne(orderData);

        // Update customer data
        const customer = await db.collection('customers').findOne({ _id: new ObjectId(orderData.customer_id) });
        if (customer) {
          await db.collection('customers').updateOne(
            { _id: new ObjectId(orderData.customer_id) },
            {
              $inc: { total_spends: orderData.amount, visits: 1 },
              $set: { last_visit: orderData.order_date }
            }
          );
        } else {
          console.error(`Customer not found for id: ${orderData.customer_id}`);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
};

startConsumer();
