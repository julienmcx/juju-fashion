require('dotenv').config();
const { runTryOn } = require('./src/services/vton');

(async () => {
  console.log('🚀 Lancement d\'1 seule inférence...');
  const t0 = Date.now();
  try {
    const url = await runTryOn({
humanImageUrl: 'https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=600',
garmentImageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',      garmentDescription: 'a sweater',
      category: 'auto',
    });
    const dt = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`✅ Succès en ${dt}s :`, url);
  } catch (err) {
    const dt = ((Date.now() - t0) / 1000).toFixed(1);
    console.error(`❌ Échec après ${dt}s :`, err.message);
  }
})();
