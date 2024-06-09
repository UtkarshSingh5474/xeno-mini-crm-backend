
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');  
const { connectDB } = require('./config/db');
const dataIngestionRoutes = require('./routes/dataIngestionRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const audienceRoutes = require('./routes/audienceRoutes');
const testRoutes = require('./routes/testRoutes'); // Import the test routes
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/data-ingestion', dataIngestionRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/audiences', audienceRoutes);
app.use('/api', testRoutes); // Use the test routes

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000; // Use 3000 as a fallback
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
