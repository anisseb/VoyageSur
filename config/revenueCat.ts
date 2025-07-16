// Configuration RevenueCat
export const REVENUECAT_CONFIG = {
  // Clés API RevenueCat
  API_KEYS: {
    ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
    android: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID,
  },
  
  // Identifiants des produits (à configurer dans RevenueCat)
  PRODUCTS: {
    // Abonnements
    MONTHLY_SUBSCRIPTION: 'voyagesur_monthly_premium',
    ANNUAL_SUBSCRIPTION: 'voyagesur_annual_premium',
    
    // Achats à l'unité
    SINGLE_TRIP: 'voyagesur_single_trip',
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
export const DEFAULT_PRODUCTS: RevenueCatProduct[] = [
  {
    id: 'voyage.sur.monthly',
    title: 'Abonnement Mensuel',
    description: 'Accès premium illimité',
    price: '4,99€',
    priceAmount: 4.99,
    currencyCode: 'EUR',
    period: 'month',
  },
  {
    id: 'voyage.sur.premium.years',
    title: 'Abonnement Annuel',
    description: 'Accès premium illimité (économisez 30%)',
    price: '49,99€',
    priceAmount: 49.99,
    currencyCode: 'EUR',
    period: 'year',
    savings: 'Économisez 30%',
  },
  {
    id: 'voyage.sur.check.sante.unique',
    title: 'Voyage à l\'unité',
    description: 'Accès complet pour un voyage',
    price: '9,99€',
    priceAmount: 9.99,
    currencyCode: 'EUR',
  },
]; 