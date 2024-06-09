const axios = require("axios");
const { getDB } = require("../config/db");
const { publishToQueue } = require("../services/pubsubService");
const { getAudienceSizeHandler } = require("./audienceController");
const { sendToVendorAPI } = require("../services/vendorApi");

const createCampaign = async (req, res) => {
  const { campaignName, campaignMessage, rules } = req.body;
  const db = getDB();

  try {
    const audienceSize = await getAudienceSizeHandler(rules);

    const communicationLog = {
      campaignName,
      campaignMessage,
      audienceRules: rules,
      audienceSize,
      deliveryStatus: "Pending",
      createdAt: new Date(),
      sentCount: 0,
      failedCount: 0,
    };

    const result = await db
      .collection("communication_log")
      .insertOne(communicationLog);
    const communicationId = result.insertedId;

    await sendCampaignMessagesInternal(communicationId);

    res
      .status(201)
      .send("Communication log created and messages are being sent");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sendCampaignMessagesInternal = async (communicationId) => {
  const db = getDB();
  const communicationLog = await db
    .collection("communication_log")
    .findOne({ _id: communicationId });

  if (!communicationLog) {
    throw new Error("Communication log not found");
  }

  const { audienceRules, campaignMessage } = communicationLog;

  let audience = [];
  if (!audienceRules || audienceRules.length === 0) {
    audience = await db.collection("customers").find().toArray();
  } else {
    const mongoQuery = parseAudienceRules(audienceRules);
    console.log(
      "Sending messages to audience:",
      JSON.stringify(audienceRules, null, 2)
    );
    console.log("MongoDB Query:", JSON.stringify(mongoQuery, null, 2));
    audience = await db
      .collection("customers")
      .find({ $and: mongoQuery })
      .toArray();
  }

  console.log("Audience size:", audience.length);

  const messages = audience.map((customer) => ({
    customerId: customer._id,
    message: campaignMessage.replace("{customer_name}", customer.name),
  }));

  for (const message of messages) {
    await sendToVendorAPI(message.message, communicationId, message.customerId);
  }
};

const getCampaigns = async (req, res) => {
  const db = getDB();
  const communications = await db
    .collection("communication_log")
    .find()
    .sort({ createdAt: -1 })
    .toArray();
  res.status(200).json(communications);
};

const parseAudienceRules = (rules) => {
  const mongoQuery = rules.map((rule) => {
    const { field, operator, value } = rule;
    let mongoOperator;
    let parsedValue = value;

    switch (operator) {
      case ">":
        mongoOperator = "$gt";
        break;
      case ">=":
        mongoOperator = "$gte";
        break;
      case "<":
        mongoOperator = "$lt";
        break;
      case "<=":
        mongoOperator = "$lte";
        break;
      case "==":
        mongoOperator = "$eq";
        break;
      case "!=":
        mongoOperator = "$ne";
        break;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }

    if (field === "last_visit") {
      parsedValue = new Date(value);
    } else {
      parsedValue = parseFloat(value);
    }

    return { [field]: { [mongoOperator]: parsedValue } };
  });

  return mongoQuery;
};

module.exports = { createCampaign, getCampaigns };
