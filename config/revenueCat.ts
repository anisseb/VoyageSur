// Configuration RevenueCat
export const REVENUECAT_CONFIG = {
  // Clés API RevenueCat
  API_KEYS: {
    ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
    android: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID,
  },
  
  // Identifiants des produits par plateforme
  PRODUCTS: {
    // Abonnements iOS
    MONTHLY_SUBSCRIPTION_IOS: 'voyage.sur.premium.monthly',
    ANNUAL_SUBSCRIPTION_IOS: 'voyage.sur.premium.years',
    SINGLE_TRIP_IOS: 'voyage.sur.check.sante.unique',
    
    // Abonnements Android
    MONTHLY_SUBSCRIPTION_ANDROID: 'voyage-sur-premium-monthly',
    ANNUAL_SUBSCRIPTION_ANDROID: 'voyage-sur-premium-years',
    SINGLE_TRIP_ANDROID: 'voyage.sur.check.sante.unique',
  },
  
  // Identifiants des entitlements (à configurer dans RevenueCat)
  ENTITLEMENTS: {
    PREMIUM: 'premium',
    SINGLE_TRIP: 'single_trip',
    FREE_TRIP: 'free_trip',
  },
  
  // Configuration des offres (à configurer dans RevenueCat)
  OFFERINGS: {
    CURRENT: 'current',
    MONTHLY: 'monthly',
    ANNUAL: 'annual',
    SINGLE_TRIP: 'single_trip',
  },
};

// Fonctions utilitaires pour récupérer les IDs selon la plateforme
export const getProductIds = (platform: 'ios' | 'android') => {
  if (platform === 'ios') {
    return {
      MONTHLY_SUBSCRIPTION: REVENUECAT_CONFIG.PRODUCTS.MONTHLY_SUBSCRIPTION_IOS,
      ANNUAL_SUBSCRIPTION: REVENUECAT_CONFIG.PRODUCTS.ANNUAL_SUBSCRIPTION_IOS,
      SINGLE_TRIP: REVENUECAT_CONFIG.PRODUCTS.SINGLE_TRIP_IOS,
    };
  } else {
    return {
      MONTHLY_SUBSCRIPTION: REVENUECAT_CONFIG.PRODUCTS.MONTHLY_SUBSCRIPTION_ANDROID,
      ANNUAL_SUBSCRIPTION: REVENUECAT_CONFIG.PRODUCTS.ANNUAL_SUBSCRIPTION_ANDROID,
      SINGLE_TRIP: REVENUECAT_CONFIG.PRODUCTS.SINGLE_TRIP_ANDROID,
    };
  }
};

// Types pour les produits
export interface RevenueCatProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currencyCode: string;
  period?: 'month' | 'year';
  savings?: string;
}

// Configuration des produits par défaut (fallback si RevenueCat n'est pas configuré)
export const getDefaultProducts = (platform: 'ios' | 'android'): RevenueCatProduct[] => {
  const productIds = getProductIds(platform);
  
  return [
    {
      id: productIds.MONTHLY_SUBSCRIPTION,
      title: 'Abonnement Mensuel',
      description: 'Accès premium illimité',
      price: '4,99€',
      priceAmount: 4.99,
      currencyCode: 'EUR',
      period: 'month',
    },
    {
      id: productIds.ANNUAL_SUBSCRIPTION,
      title: 'Abonnement Annuel',
      description: 'Accès premium illimité (économisez 30%)',
      price: '49,99€',
      priceAmount: 49.99,
      currencyCode: 'EUR',
      period: 'year',
      savings: 'Économisez 30%',
    },
    {
      id: productIds.SINGLE_TRIP,
      title: 'Voyage à l\'unité',
      description: 'Accès complet pour un voyage',
      price: '9,99€',
      priceAmount: 9.99,
      currencyCode: 'EUR',
    },
  ];
}; 