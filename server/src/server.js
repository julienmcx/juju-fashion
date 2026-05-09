require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const articlesRoutes = require('./routes/articles');
app.use('/api/articles', articlesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'juju-api' });
});

app.listen(PORT, () => {
  console.log(`Juju API running on http://localhost:${PORT}`);
});