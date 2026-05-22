import { useEffect, useState } from 'react';

const STORAGE_KEY = 'juju_density';

export function useDensity() {
  const [density, setDensity] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'comfortable';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, density);
    document.documentElement.dataset.density = density;
  }, [density]);

  return [density, setDensity];
}