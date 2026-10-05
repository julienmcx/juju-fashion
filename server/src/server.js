require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Fail-fast : sans JWT_SECRET, toute l'authentification est cassée/non sécurisée.
if (!process.env.JWT_SECRET) {
  console.error('[CONFIG] JWT_SECRET manquant — arrêt. Définis-le dans ton .env.');
  process.exit(1);
}
// Avertissements non bloquants pour les variables importantes (surtout en prod).
for (const v of ['DB_HOST', 'DB_NAME', 'PUBLIC_URL']) {
  if (!process.env[v]) console.warn(`[CONFIG] Variable ${v} absente — valeurs par défaut (dev).`);
}

app.use(cors());

// Webhook Stripe : doit recevoir le corps BRUT (avant express.json) pour
// vérifier la signature.
app.post(
  '/api/billing/webhook',
  express.raw({ type: 'application/json' }),
  require('./controllers/billingController').webhook
);

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  setHeaders: (res) => {
    // Empêche le navigateur d'interpréter un upload comme HTML/JS (anti content-sniffing).
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Content-Disposition', 'inline');
  },
}));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const articlesRoutes = require('./routes/articles');
app.use('/api/articles', articlesRoutes);

const tryonRoutes = require('./routes/tryon');
app.use('/api/tryon', tryonRoutes);

const backgroundRemoveRoutes = require('./routes/backgroundRemove');
app.use('/api/background-remove', backgroundRemoveRoutes);

const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);

const billingRoutes = require('./routes/billing');
app.use('/api/billing', billingRoutes);

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
app.use('/api/essayages', require('./routes/essayages'));

// Gestionnaire d'erreurs global (erreurs Multer & co.) -> JSON propre plutôt qu'une page HTML 500.
app.use((err, req, res, next) => {
  if (!err) return next();
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Fichier trop volumineux (max 10 MB)' });
  }
  console.error('[ERROR]', err.message);
  return res.status(400).json({ error: err.message || 'Requête invalide' });
});

app.listen(PORT, () => {
  console.log(`Juju API running on http://localhost:${PORT}`);
});