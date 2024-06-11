const { getDB } = require("../config/db");

const getAudienceSizeHandler = async (rules) => {
  const db = getDB();

  let query = { $and: [] };

  rules.forEach((rule) => {
    let condition = {};
    let value = rule.value;

    if (rule.field === "last_visit") {
      value = new Date(value);
    } else if (rule.field === "visits") {
      value = parseInt(value, 10);
    } else if (rule.field === "total_spends") {
      value = parseFloat(value);
    }

    const dateCondition = (operator, value) => ({
      $expr: {
        [operator]: [
          { $dateFromParts: { year: { $year: "$last_visit" }, month: { $month: "$last_visit" }, day: { $dayOfMonth: "$last_visit" } } },
          value
        ]
      }
    });

    switch (rule.operator) {
      case ">":
        condition = rule.field === "last_visit" ? dateCondition("$gt", value) : { [rule.field]: { $gt: value } };
        break;
      case "<":
        condition = rule.field === "last_visit" ? dateCondition("$lt", value) : { [rule.field]: { $lt: value } };
        break;
      case "=":
        condition = rule.field === "last_visit" ? dateCondition("$eq", value) : { [rule.field]: value };
        break;
      case "!=":
        condition = rule.field === "last_visit" ? dateCondition("$ne", value) : { [rule.field]: { $ne: value } };
        break;
      case ">=":
        condition = rule.field === "last_visit" ? dateCondition("$gte", value) : { [rule.field]: { $gte: value } };
        break;
      case "<=":
        condition = rule.field === "last_visit" ? dateCondition("$lte", value) : { [rule.field]: { $lte: value } };
        break;
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
