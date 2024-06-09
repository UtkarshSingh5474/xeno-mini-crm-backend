const amqp = require('amqplib');
require("dotenv").config();
const { connectDB, getDB } = require("./db");
const { ObjectId } = require("mongodb");

const url = process.env.RABBITMQ_URI;

let connection = null;
let channel = null;

let deliveryReceiptsQueue = [];

const consumeQueue = async (callback) => {
  const { channel } = await connectQueue();
  channel.consume('dataQueue', (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      callback(data);
      channel.ack(msg);
    }
  });
};

const connectQueue = async () => {
  if (connection && channel) {
    return { connection, channel };
  }

  connection = await amqp.connect(url);
  channel = await connection.createChannel();
  await channel.assertQueue('dataQueue', { durable: true });

  console.log('Connected to RabbitMQ');
  return { connection, channel };
};

const startConsumer = async () => {
  await connectDB();
  consumeQueue(async (message) => {
    const db = getDB();
    try {
      if (message.type === "deliveryReceipt") {
        deliveryReceiptsQueue.push(message.data);
      } else if (message.type === "customer") {
        await db.collection("customers").insertOne(message.data);
      } else if (message.type === "order") {
        const orderData = message.data;
        await db.collection("orders").insertOne(orderData);

        const customer = await db
          .collection("customers")
          .findOne({ _id: new ObjectId(orderData.customer_id) });
        if (customer) {
          await db.collection("customers").updateOne(
            { _id: new ObjectId(orderData.customer_id) },
            {
              $inc: { total_spends: orderData.amount, visits: 1 },
              $set: { last_visit: orderData.order_date },
            }
          );
        } else {
          console.error(`Customer not found for id: ${orderData.customer_id}`);
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  setInterval(async () => {
    if (deliveryReceiptsQueue.length > 0) {
      const batch = [...deliveryReceiptsQueue];
      deliveryReceiptsQueue = [];
      await processDeliveryReceiptsBatch(batch);
    }
  }, 60000);
};

const processDeliveryReceiptsBatch = async (batch) => {
  const db = getDB();
  try {
    const bulkOperations = batch.map((receipt) => {
      const updateField =
        receipt.status === "SENT" ? { sentCount: 1 } : { failedCount: 1 };
      return {
        updateOne: {
          filter: { _id: new ObjectId(receipt.communicationId) },
          update: { $inc: updateField },
        },
      };
    });

    await db.collection("communication_log").bulkWrite(bulkOperations);

    for (const receipt of batch) {
      const communicationLog = await db
        .collection("communication_log")
        .findOne({ _id: new ObjectId(receipt.communicationId) });
      if (!communicationLog) {
        console.error(
          `Communication log not found for id: ${receipt.communicationId}`
        );
        continue;
      }

      if (
        communicationLog.audienceSize ===
        communicationLog.sentCount + communicationLog.failedCount
      ) {
        const overallStatus =
          communicationLog.sentCount === communicationLog.audienceSize
            ? "Completed"
            : "Failed";
        await db
          .collection("communication_log")
          .updateOne(
            { _id: new ObjectId(receipt.communicationId) },
            { $set: { deliveryStatus: overallStatus } }
          );
      }
    }
    console.log("Processed delivery receipts batch:", batch.length);
  } catch (error) {
    console.error("Error processing delivery receipts batch:", error);
  }
};

startConsumer();
