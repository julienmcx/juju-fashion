const fs = require('fs');
const path = require('path');
const { UPLOAD_DIR } = require('../middlewares/upload');

const FASHN_BASE_URL = 'https://api.fashn.ai/v1';
const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 40;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function localUrlToBase64(url) {
  const filename = path.basename(url);
  const filepath = path.join(UPLOAD_DIR, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`Fichier introuvable: ${filename}`);
  }
  const buffer = fs.readFileSync(filepath);
  const ext = path.extname(filename).slice(1).toLowerCase();
  const mime = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : `image/${ext}`;
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

function isLocalUrl(url) {
  if (!url) return false;
  if (url.startsWith('data:')) return false;
  const localPatterns = ['localhost', '127.0.0.1'];
  if (process.env.PUBLIC_URL) {
    try {
      const host = new URL(process.env.PUBLIC_URL).host;
      localPatterns.push(host);
    } catch {}
  }
  return localPatterns.some((p) => url.includes(p));
}

async function runTryOn({ humanImageUrl, garmentImageUrl, category }) {
  if (!process.env.FASHN_API_KEY) {
    throw new Error('FASHN_API_KEY manquante dans .env');
  }

  const model_image = isLocalUrl(humanImageUrl) ? localUrlToBase64(humanImageUrl) : humanImageUrl;
  const garment_image = isLocalUrl(garmentImageUrl) ? localUrlToBase64(garmentImageUrl) : garmentImageUrl;

  const submitRes = await fetch(`${FASHN_BASE_URL}/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.FASHN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model_name: 'tryon-v1.6',
      inputs: {
        model_image,
        garment_image,
        category: category || 'auto',
      },
    }),
  });

  if (!submitRes.ok) {
    const errText = await submitRes.text();
    throw new Error(`FASHN /run failed (${submitRes.status}): ${errText}`);
  }

  const submitData = await submitRes.json();
  if (!submitData.id) {
    throw new Error(`FASHN n'a pas retourné d'ID: ${JSON.stringify(submitData)}`);
  }

  const predictionId = submitData.id;

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);

    const statusRes = await fetch(`${FASHN_BASE_URL}/status/${predictionId}`, {
      headers: { 'Authorization': `Bearer ${process.env.FASHN_API_KEY}` },
    });

    if (!statusRes.ok) {
      throw new Error(`FASHN /status failed (${statusRes.status})`);
    }

    const status = await statusRes.json();

    if (status.status === 'completed') {
      if (Array.isArray(status.output) && status.output.length > 0) {
        return status.output[0];
      }
      throw new Error('FASHN completed mais output vide');
    }

    if (status.status === 'failed') {
      throw new Error(`FASHN prediction failed: ${status.error?.message || status.error || 'unknown error'}`);
    }
  }

  throw new Error(`FASHN timeout après ${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000}s`);
}

module.exports = { runTryOn };
