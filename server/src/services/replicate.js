const Replicate = require('replicate');
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
const IDM_VTON_OWNER = 'cuuupid';
const IDM_VTON_NAME = 'idm-vton';

let cachedVersion = null;

async function getLatestVersion() {
  if (cachedVersion) return cachedVersion;
  const model = await replicate.models.get(IDM_VTON_OWNER, IDM_VTON_NAME);
  cachedVersion = model.latest_version.id;
  console.log(`[VTON] IDM-VTON version utilisée: ${cachedVersion.slice(0, 8)}…`);
  return cachedVersion;
}

async function runTryOn({ humanImageUrl, garmentImageUrl, garmentDescription, category }) {
  const version = await getLatestVersion();

  const output = await replicate.run(`${IDM_VTON_OWNER}/${IDM_VTON_NAME}:${version}`, {
    input: {
      human_img: humanImageUrl,
      garm_img: garmentImageUrl,
      garment_des: garmentDescription || 'a piece of clothing',
      category: category || 'upper_body',
      crop: false,
      seed: 42,
      steps: 30,
    },
  });


  if (typeof output === 'string') return output;
  if (output && typeof output.url === 'function') return output.url();
  if (Array.isArray(output) && output.length > 0) {
    const first = output[0];
    if (typeof first === 'string') return first;
    if (first && typeof first.url === 'function') return first.url();
  }
  throw new Error('Format de sortie Replicate inattendu');
}

module.exports = { runTryOn };