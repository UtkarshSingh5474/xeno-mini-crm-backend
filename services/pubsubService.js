const amqp = require('amqplib');
const { connectDB, getDB } = require('../config/db');

const url = process.env.RABBITMQ_URI;

const connectQueue = async () => {
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();
  await channel.assertQueue('dataQueue', { durable: true });
  return { connection, channel };
};

const publishToQueue = async (message) => {
  const { channel } = await connectQueue();
  channel.sendToQueue('dataQueue', Buffer.from(JSON.stringify(message)));
  console.log('Message published to queue:', message);
};

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

module.exports = { publishToQueue, consumeQueue };
