const db = require('../db');
const { stripe, isConfigured } = require('../services/stripe');
const { getPremiumState } = require('../services/premium');

const PREMIUM_PRICE = 9.99;
const clientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

/** GET /api/billing/status — état d'abonnement de l'utilisateur courant. */
async function getStatus(req, res) {
  try {
    const state = await getPremiumState(req.user.id_utilisateur);
    return res.json({ ...state, price: PREMIUM_PRICE, configured: isConfigured() });
  } catch (err) {
    console.error('[BILLING] getStatus error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

/** Récupère (ou crée) le client Stripe associé à l'utilisateur. */
async function ensureCustomer(userId) {
  const { rows } = await db.query(
    `SELECT email, nom, stripe_customer_id FROM utilisateurs WHERE id_utilisateur = $1`,
    [userId]
  );
  const user = rows[0];
  if (!user) throw new Error('Utilisateur introuvable');
  if (user.stripe_customer_id) return user.stripe_customer_id;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.nom || undefined,
    metadata: { id_utilisateur: String(userId) },
  });
  await db.query(
    `UPDATE utilisateurs SET stripe_customer_id = $1 WHERE id_utilisateur = $2`,
    [customer.id, userId]
  );
  return customer.id;
}

/** POST /api/billing/checkout — démarre l'abonnement (Stripe Checkout). */
async function createCheckout(req, res) {
  if (!isConfigured()) {
    return res.status(503).json({ error: 'Paiement non configuré sur le serveur.' });
  }
  try {
    const userId = req.user.id_utilisateur;
    const customerId = await ensureCustomer(userId);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID, quantity: 1 }],
      client_reference_id: String(userId),
      allow_promotion_codes: true,
      success_url: `${clientUrl()}/profil?upgrade=success`,
      cancel_url: `${clientUrl()}/profil?upgrade=cancel`,
    });
    return res.json({ url: session.url });
  } catch (err) {
    console.error('[BILLING] createCheckout error:', err);
    return res.status(500).json({ error: 'Impossible de démarrer le paiement.' });
  }
}

/** POST /api/billing/portal — portail Stripe pour gérer/annuler l'abonnement. */
async function createPortal(req, res) {
  if (!stripe) {
    return res.status(503).json({ error: 'Paiement non configuré sur le serveur.' });
  }
  try {
    const { rows } = await db.query(
      `SELECT stripe_customer_id FROM utilisateurs WHERE id_utilisateur = $1`,
      [req.user.id_utilisateur]
    );
    const customerId = rows[0]?.stripe_customer_id;
    if (!customerId) return res.status(400).json({ error: 'Aucun abonnement à gérer.' });

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${clientUrl()}/profil`,
    });
    return res.json({ url: session.url });
  } catch (err) {
    console.error('[BILLING] createPortal error:', err);
    return res.status(500).json({ error: "Impossible d'ouvrir le portail de gestion." });
  }
}

/** Reporte l'état d'un abonnement Stripe sur la ligne utilisateur correspondante. */
async function applySubscription(sub) {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
  if (!customerId) return;

  // current_period_end est au niveau de l'abonnement (ancien) ou de l'item (récent).
  const periodEndUnix = sub.current_period_end
    ?? sub.items?.data?.[0]?.current_period_end
    ?? null;
  const periodEnd = periodEndUnix ? new Date(periodEndUnix * 1000) : null;

  await db.query(
    `UPDATE utilisateurs
        SET stripe_subscription_id = $1,
            subscription_status     = $2,
            premium_until           = $3
      WHERE stripe_customer_id = $4`,
    [sub.id, sub.status, periodEnd, customerId]
  );
}

/** POST /api/billing/webhook — événements Stripe (corps brut requis). */
async function webhook(req, res) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).send('Webhook non configuré');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // Buffer brut (express.raw)
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[BILLING] Signature webhook invalide:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          await applySubscription(sub);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await applySubscription(event.data.object);
        break;
      default:
        break;
    }
    return res.json({ received: true });
  } catch (err) {
    console.error('[BILLING] webhook handler error:', err);
    return res.status(500).send('Erreur traitement webhook');
  }
}

module.exports = { getStatus, createCheckout, createPortal, webhook };
