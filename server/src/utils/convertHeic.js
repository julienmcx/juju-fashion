const fs = require('fs');
const path = require('path');
const convert = require('heic-convert');
const sharp = require('sharp');

/**
 * Si le fichier uploadé est un HEIC/HEIF, le convertit en WebP,
 * supprime l'original et renvoie le nouveau chemin + nom.
 * Sinon renvoie le fichier inchangé.
 *
 * heic-convert ne sait produire que du JPEG/PNG : on décode donc
 * le HEIC en PNG (sans perte) puis on encode le résultat en WebP
 * via sharp.
 */
async function ensureWebFriendly(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.heic' && ext !== '.heif') {
        return filePath; // déjà lisible par les navigateurs
    }

    const inputBuffer = fs.readFileSync(filePath);
    const pngBuffer = await convert({
        buffer: inputBuffer,
        format: 'PNG',
    });
    const outputBuffer = await sharp(pngBuffer)
        .webp({ quality: 80 })
        .toBuffer();

    const newPath = filePath.replace(/\.(heic|heif)$/i, '.webp');
    fs.writeFileSync(newPath, outputBuffer);
    fs.unlinkSync(filePath);

    return newPath;
}

module.exports = { ensureWebFriendly };
