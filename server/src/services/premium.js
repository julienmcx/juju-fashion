const db = require('../db');

// Statuts Stripe considérés comme « abonnement actif »
const ACTIVE_STATUSES = ['active', 'trialing'];

/**
 * Calcule l'état Premium d'un utilisateur à partir des colonnes d'abonnement.
 * Premium = statut actif/trialing ET (pas de date de fin ou date future).
 */
async function getPremiumState(userId) {
  const { rows } = await db.query(
    `SELECT subscription_status, premium_until, stripe_customer_id, stripe_subscription_id
     FROM utilisateurs WHERE id_utilisateur = $1`,
    [userId]
  );
  const u = rows[0] || {};
  const statusActive = ACTIVE_STATUSES.includes(u.subscription_status);
  const notExpired = !u.premium_until || new Date(u.premium_until) > new Date();

  return {
    is_premium: Boolean(statusActive && notExpired),
    status: u.subscription_status || null,
    premium_until: u.premium_until || null,
    has_customer: Boolean(u.stripe_customer_id),
  };
}

async function isPremium(userId) {
  return (await getPremiumState(userId)).is_premium;
}

module.exports = { getPremiumState, isPremium, ACTIVE_STATUSES };
