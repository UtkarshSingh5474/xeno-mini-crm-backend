const { getDB } = require("../config/db");

const getAudienceSizeHandler = async (rules) => {
  const db = getDB();

  let query = { $and: [] };

  rules.forEach((rule) => {
    let condition = {};
    let value = rule.value;

    if (rule.field === "last_visit") {
      value = new ISODate(value);
      let startOfDay = new Date(value.setUTCHours(0, 0, 0, 0));
      let endOfDay = new Date(value.setUTCHours(23, 59, 59, 999));
      
      switch (rule.operator) {
        case ">":
          condition[rule.field] = { $gt: endOfDay };
          break;
        case "<":
          condition[rule.field] = { $lt: startOfDay };
          break;
        case "=":
          condition[rule.field] = { $gte: startOfDay, $lt: endOfDay };
          break;
        case "!=":
          condition[rule.field] = { $not: { $gte: startOfDay, $lt: endOfDay } };
          break;
        case ">=":
          condition[rule.field] = { $gte: startOfDay };
          break;
        case "<=":
          condition[rule.field] = { $lt: endOfDay };
          break;
      }
    } else {
      if (rule.field === "visits") {
        value = parseInt(value, 10);
      } else if (rule.field === "total_spends") {
        value = parseFloat(value);
      }

      switch (rule.operator) {
        case ">":
          condition[rule.field] = { $gt: value };
          break;
        case "<":
          condition[rule.field] = { $lt: value };
          break;
        case "=":
          condition[rule.field] = value;
          break;
        case "!=":
          condition[rule.field] = { $ne: value };
          break;
        case ">=":
          condition[rule.field] = { $gte: value };
          break;
        case "<=":
          condition[rule.field] = { $lte: value };
          break;
      }
    }

    if (rule.condition === "AND") {
      query.$and.push(condition);
    } else {
      if (!query.$or) {
        query.$or = [];
      }
      query.$or.push(condition);
    }
  });

  if (query.$and.length === 0) {
    delete query.$and;
  }

  try {
    const audienceSize = await db.collection("customers").countDocuments(query);
    return audienceSize;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAudienceSize = async (req, res) => {
  const { rules } = req.body;
  try {
    const audienceSize = await getAudienceSizeHandler(rules);
    res.json({ size: audienceSize });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAudienceSize, getAudienceSizeHandler };
