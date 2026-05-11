function mapCategoryForVTON(categorieNom, categorieType) {
  const nom = (categorieNom || '').toLowerCase();

  // Robes : catégorie spécifique
  if (nom.includes('robe')) return 'dresses';

  // Bas : pantalon, jean, short, jupe, ceinture
  const bas = ['pantalon', 'jean', 'short', 'jupe', 'bas', 'ceinture'];
  if (bas.some((b) => nom.includes(b))) return 'lower_body';

  if (categorieType === 'chaussure') return 'lower_body';

  return 'upper_body';
}

function isVTONSupported(categorieType) {
  return ['vetement', 'accessoire', 'chaussure'].includes(categorieType);
}

module.exports = { mapCategoryForVTON, isVTONSupported };