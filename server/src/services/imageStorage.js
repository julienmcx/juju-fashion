const fs = require('fs').promises;
const path = require('path');
const { randomUUID } = require('crypto');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'essayages');

/**
 * Télécharge une image depuis une URL et la stocke localement.
 * Renvoie le chemin /uploads/essayages/xxx.jpg utilisable par le front.
 */
async function downloadAndStore(remoteUrl, prefix = 'essai') {
    if (!remoteUrl) return null;

    // Assure que le dossier existe
    await fs.mkdir(UPLOADS_DIR, { recursive: true });

    const response = await fetch(remoteUrl);
    if (!response.ok) {
        throw new Error(`Téléchargement échoué (${response.status}) pour ${remoteUrl}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());

    const filename = `${prefix}-${randomUUID()}.jpg`;
    const filepath = path.join(UPLOADS_DIR, filename);
    await fs.writeFile(filepath, buffer);

    // Chemin web exposé par /uploads (statique dans server.js)
    return `/uploads/essayages/${filename}`;
}

/**
 * Supprime un fichier local (silencieux si déjà absent).
 */
async function removeFile(webPath) {
    if (!webPath || !webPath.startsWith('/uploads/essayages/')) return;
    const filename = path.basename(webPath);
    const filepath = path.join(UPLOADS_DIR, filename);
    try {
        await fs.unlink(filepath);
    } catch (err) {
        if (err.code !== 'ENOENT') console.warn('[imageStorage] removeFile:', err.message);
    }
}

module.exports = { downloadAndStore, removeFile };