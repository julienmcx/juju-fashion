import apiClient from './client';

// État d'abonnement de l'utilisateur courant
export const fetchBillingStatus = () =>
  apiClient.get('/billing/status').then((r) => r.data);

// Démarre un abonnement Premium → renvoie { url } (Stripe Checkout)
export const startCheckout = () =>
  apiClient.post('/billing/checkout').then((r) => r.data);

// Ouvre le portail Stripe de gestion d'abonnement → renvoie { url }
export const openBillingPortal = () =>
  apiClient.post('/billing/portal').then((r) => r.data);
