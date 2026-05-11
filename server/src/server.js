require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const articlesRoutes = require('./routes/articles');
app.use('/api/articles', articlesRoutes);

const tryonRoutes = require('./routes/tryon');
app.use('/api/tryon', tryonRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'juju-api' });
});

const categoriesRoutes = require('./routes/categories');
const couleursRoutes = require('./routes/couleurs');
const matieresRoutes = require('./routes/matieres');
const marquesRoutes = require('./routes/marques');
const uploadRoutes = require('./routes/upload');
const avatarRoutes = require('./routes/avatar');

app.use('/api/upload', uploadRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/couleurs', couleursRoutes);
app.use('/api/matieres', matieresRoutes);
app.use('/api/marques', marquesRoutes);


app.listen(PORT, () => {
  console.log(`Juju API running on http://localhost:${PORT}`);
});