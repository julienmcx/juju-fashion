const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');
const sharp = require('sharp');
const heicConvert = require('heic-convert');
const { UPLOAD_DIR } = require('../middlewares/upload');

const HEIC_EXTS = new Set(['.heic', '.heif']);
const MAX_DIM = 2000;        // borne la plus grande dimension (photos mode/dressing)
const WEBP_QUALITY = 82;

/**
 * Décode l'image (HEIC inclus), corrige l'orientation EXIF, redimensionne
 * et ré-encode en WebP. Renvoie un Buffer WebP.
 */
async function toWebpBuffer(inputBuffer, ext) {
  let buf = inputBuffer;

  // Les binaires sharp préfabriqués ne décodent pas toujours le HEIC/HEIF :
  // on passe d'abord par heic-convert (libheif) pour obtenir un JPEG.
  if (HEIC_EXTS.has((ext || '').toLowerCase())) {
    buf = Buffer.from(await heicConvert({ buffer: buf, format: 'JPEG', quality: 0.92 }));
  }

  return sharp(buf, { failOn: 'none' })
    .rotate() // applique puis neutralise l'orientation EXIF
    .resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

/**
 * Middleware Express : convertit le fichier déposé par multer (sur disque)
 * en WebP léger. Met à jour req.file (filename / path / mimetype / size).
 *
 * Résilient : si la conversion échoue, on conserve le fichier d'origine
 * pour ne jamais bloquer un upload.
 */
async function webpConvert(req, res, next) {
  if (!req.file) return next();

  const original = req.file;
  try {
    const inputBuffer = await fsp.readFile(original.path);
    const ext = path.extname(original.originalname || original.filename);
    const webpBuffer = await toWebpBuffer(inputBuffer, ext);

    const filename = `${randomUUID()}.webp`;
    const outPath = path.join(UPLOAD_DIR, filename);
    await fsp.writeFile(outPath, webpBuffer);

    // Supprime l'original (best-effort)
    fs.unlink(original.path, () => {});

    req.file.filename = filename;
    req.file.path = outPath;
    req.file.mimetype = 'image/webp';
    req.file.size = webpBuffer.length;
    return next();
  } catch (err) {
    console.warn('[imageProcessing] Conversion WebP échouée, fichier original conservé :', err.message);
    return next();
  }
}

module.exports = { toWebpBuffer, webpConvert };
