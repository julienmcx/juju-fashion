import { useEffect, useState } from 'react';
import { fetchCategories, fetchMarques, fetchCouleurs } from '../api/referentiels';

// Cache mémoire : on charge une seule fois par session
let cachedData = null;
let cachedPromise = null;

export function useReferentiels() {
  const [data, setData] = useState(cachedData);
  const [loading, setLoading] = useState(!cachedData);

  useEffect(() => {
    let mounted = true;
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
      if (!mounted) return;
      setData(d);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  // Met à jour les marques DANS le cache module ET dans l'état local.
  // Accepte soit un tableau, soit une fonction (prev) => next (comme un setState).
  const setMarques = (updater) => {
    if (!cachedData) return;
    const nextMarques =
      typeof updater === 'function' ? updater(cachedData.marques) : updater;
    cachedData = { ...cachedData, marques: nextMarques };
    setData(cachedData);
  };

  return { data, loading, setMarques };
}