export const retargetingRoutes = [
  { path: '/en/welcome-back', lang: 'en', slug: 'welcome-back' },
  { path: '/es/bienvenido', lang: 'es', slug: 'bienvenido' },
] as const;

export type RetargetingRoute = typeof retargetingRoutes[number];

export const getRetargetingUrl = (lang: string): string => {
  const route = retargetingRoutes.find(r => r.lang === lang);
  return route ? route.path : '/en/welcome-back';
};

export const getLanguageFromPath = (path: string): string => {
  const route = retargetingRoutes.find(r => r.path === path);
  return route ? route.lang : 'en';
};

export const isRetargetingPath = (path: string): boolean => {
  return retargetingRoutes.some(r => r.path === path);
};
