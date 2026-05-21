function mapCategoryForVTON(categorieNom, categorieType) {
  const nom = (categorieNom || '').toLowerCase();

  // Robes : catégorie spécifique
  if (nom.includes('robe')) return 'one-pieces';

  // Bas : pantalon, jean, short, jupe, ceinture
  const bas = ['pantalon', 'jean', 'short', 'jupe', 'bas', 'ceinture'];
  if (bas.some((b) => nom.includes(b))) return 'bottoms';

  if (categorieType === 'chaussure') return 'bottoms';

  return 'tops';
}

function isVTONSupported(categorieType) {
  return ['vetement', 'accessoire', 'chaussure'].includes(categorieType);
}

module.exports = { mapCategoryForVTON, isVTONSupported };