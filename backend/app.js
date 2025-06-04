const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chargers', require('./routes/chargerRoutes'));


const PORT = process.env.PORT || 5000;


app.get('/', (req, res) => {
  res.send('API is running...');
});


app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await sequelize.sync(); // Sync DB
});
