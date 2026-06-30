const Stripe = require('stripe');

// Instancié uniquement si la clé est présente : l'app démarre sans Stripe,
// les routes de paiement renvoient alors une 503 explicite.
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Stripe complètement opérationnel = clé secrète + identifiant de prix.
function isConfigured() {
  return Boolean(stripe && process.env.STRIPE_PREMIUM_PRICE_ID);
}

module.exports = { stripe, isConfigured };
