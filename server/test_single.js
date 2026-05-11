require('dotenv').config();
const { runTryOn } = require('./src/services/replicate');

(async () => {
  console.log('🚀 Lancement d\'1 seule inférence...');
  const t0 = Date.now();
  try {
    const url = await runTryOn({
      humanImageUrl: 'https://replicate.delivery/pbxt/KgwTlhCMvDIJNGqkw0nNSeoO9YyAhxyM7s3M01rfaTdg7HEi/KakaoTalk_Photo_2024-04-04-21-44-45.png',
      garmentImageUrl: 'https://replicate.delivery/pbxt/KgwTlZ8hkVx2BgechCEFhURiQfDPWqB5gFkj6PSPlVE05oVo/sweater.webp',
      garmentDescription: 'a sweater',
      category: 'upper_body',
    });
    const dt = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`✅ Succès en ${dt}s :`, url);
  } catch (err) {
    const dt = ((Date.now() - t0) / 1000).toFixed(1);
    console.error(`❌ Échec après ${dt}s :`, err.message);
  }
})();
