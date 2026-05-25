import { useEffect, useState } from 'react';
import { fetchCategories, fetchMarques, fetchCouleurs } from '../api/referentiels';

// Cache mémoire : on charge une seule fois par session
let cachedData = null;
let cachedPromise = null;

export function useReferentiels() {
  const [data, setData] = useState(cachedData);
  const [loading, setLoading] = useState(!cachedData);

  useEffect(() => {
    if (cachedData) return;
    if (!cachedPromise) {
      cachedPromise = Promise.all([
        fetchCategories(),
        fetchMarques(),
        fetchCouleurs(),
      ]).then(([categories, marques, couleurs]) => {
        cachedData = { categories, marques, couleurs };
        return cachedData;
      });
    }
    cachedPromise.then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}
