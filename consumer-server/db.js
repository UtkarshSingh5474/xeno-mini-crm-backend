const { MongoClient } = require("mongodb");
const url = process.env.MONGODB_URI;
const dbName = "xeno-mini-crm";

let db;

const connectDB = async () => {
  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  db = client.db(dbName);
  console.log(`Connected to database: ${dbName}`);
};

const getDB = () => db;

module.exports = { connectDB, getDB };
