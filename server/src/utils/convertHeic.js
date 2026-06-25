const fs = require('fs');
const path = require('path');
const convert = require('heic-convert');

/**
 * Si le fichier uploadé est un HEIC/HEIF, le convertit en JPEG,
 * supprime l'original et renvoie le nouveau chemin + nom.
 * Sinon renvoie le fichier inchangé.
 */
async function ensureWebFriendly(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.heic' && ext !== '.heif') {
        return filePath; // déjà lisible par les navigateurs
    }

    const inputBuffer = fs.readFileSync(filePath);
    const outputBuffer = await convert({
        buffer: inputBuffer,
        format: 'JPEG',
        quality: 0.9,
    });

    const newPath = filePath.replace(/\.(heic|heif)$/i, '.jpg');
    fs.writeFileSync(newPath, outputBuffer);
    fs.unlinkSync(filePath);

    return newPath;
}

module.exports = { ensureWebFriendly };