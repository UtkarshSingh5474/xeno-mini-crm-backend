const { getDB } = require('../config/db');

const testDBConnection = async (req, res) => {
  try {
    const db = getDB();
    // Attempt to fetch a document from a test collection
    const testCollection = db.collection('test');
    const testDocument = await testCollection.findOne({});
    res.status(200).json({
      message: 'Database connection successful',
      document: testDocument,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection failed', error });
  }
};

const getDefaultResponse = (req, res) => {
  res.status(200).json({ message: 'API is running' });
};

module.exports = { testDBConnection, getDefaultResponse };
