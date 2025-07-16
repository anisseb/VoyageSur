import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';
import { REVENUECAT_CONFIG, DEFAULT_PRODUCTS } from '../config/revenueCat';

// Types pour les produits
export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currencyCode: string;
  packageType: string;
}

export interface SubscriptionPlan {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currencyCode: string;
  period: 'month' | 'year';
  savings?: string;
}

export interface SinglePurchase {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currencyCode: string;
}

class PurchaseService {
  private isInitialized = false;

  // Initialiser RevenueCat
  async initialize() {
    if (this.isInitialized) return;

    try {
      const apiKey = Platform.OS === 'ios' 
        ? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
        : process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;

      if (!apiKey) {
        console.error('RevenueCat API key not found');
        return;
      }

      await Purchases.configure({ apiKey });
      this.isInitialized = true;
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
    }
  }

  // Récupérer les offres disponibles
  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      await this.initialize();
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('Error getting offerings:', error);
      return null;
    }
  }

  // Récupérer les abonnements disponibles
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const offering = await this.getOfferings();
      if (!offering) {
        // Fallback vers les produits par défaut
        return DEFAULT_PRODUCTS.filter(p => p.period === 'month' || p.period === 'year') as SubscriptionPlan[];
      }

      const monthlyPackage = offering.monthly;
      const annualPackage = offering.annual;

      const plans: SubscriptionPlan[] = [];

      if (monthlyPackage) {
        plans.push({
          id: monthlyPackage.identifier,
          title: 'Abonnement Mensuel',
          description: 'Accès premium illimité',
          price: monthlyPackage.product.priceString,
          priceAmount: monthlyPackage.product.price,
          currencyCode: monthlyPackage.product.currencyCode,
          period: 'month'
        });
      }

      if (annualPackage) {
        const annualPrice = annualPackage.product.price;
        const monthlyPrice = monthlyPackage?.product.price || 0;
        const yearlyCost = monthlyPrice * 12;
        const savings = yearlyCost - annualPrice;
        const savingsPercent = Math.round((savings / yearlyCost) * 100);

        plans.push({
          id: annualPackage.identifier,
          title: 'Abonnement Annuel',
          description: 'Accès premium illimité (économisez sur l\'année)',
          price: annualPackage.product.priceString,
          priceAmount: annualPackage.product.price,
          currencyCode: annualPackage.product.currencyCode,
          period: 'year',
          savings: `Économisez ${savingsPercent}%`
        });
      }

      return plans;
    } catch (error) {
      console.error('Error getting subscription plans:', error);
      // Fallback vers les produits par défaut
      return DEFAULT_PRODUCTS.filter(p => p.period === 'month' || p.period === 'year') as SubscriptionPlan[];
    }
  }

  // Récupérer les achats à l'unité
  async getSinglePurchases(): Promise<SinglePurchase[]> {
    try {
      const offering = await this.getOfferings();
      if (!offering) {
        // Fallback vers les produits par défaut
        return DEFAULT_PRODUCTS.filter(p => !p.period) as SinglePurchase[];
      }

      // Chercher les packages d'achat à l'unité
      const singlePurchasePackages = offering.availablePackages.filter(
        pkg => pkg.identifier.includes('single_trip') || pkg.identifier.includes('trip_purchase')
      );

      if (singlePurchasePackages.length === 0) {
        // Fallback vers les produits par défaut
        return DEFAULT_PRODUCTS.filter(p => !p.period) as SinglePurchase[];
      }

      return singlePurchasePackages.map(pkg => ({
        id: pkg.identifier,
        title: 'Voyage à l\'unité',
        description: 'Accès complet pour un voyage',
        price: pkg.product.priceString,
        priceAmount: pkg.product.price,
        currencyCode: pkg.product.currencyCode
      }));
    } catch (error) {
      console.error('Error getting single purchases:', error);
      // Fallback vers les produits par défaut
      return DEFAULT_PRODUCTS.filter(p => !p.period) as SinglePurchase[];
    }
  }

  // Acheter un abonnement
  async purchaseSubscription(packageId: string): Promise<boolean> {
    try {
      await this.initialize();
      const offering = await this.getOfferings();
      if (!offering) return false;

      const pkg = offering.availablePackages.find(p => p.identifier === packageId);
      if (!pkg) return false;

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return this.checkPremiumStatus(customerInfo);
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      return false;
    }
  }

  // Acheter un voyage à l'unité
  async purchaseSingleTrip(packageId: string): Promise<boolean> {
    try {
      await this.initialize();
      const offering = await this.getOfferings();
      if (!offering) return false;

      const pkg = offering.availablePackages.find(p => p.identifier === packageId);
      if (!pkg) return false;

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return this.checkSingleTripAccess(customerInfo);
    } catch (error) {
      console.error('Error purchasing single trip:', error);
      return false;
    }
  }

  // Vérifier si l'utilisateur est premium
  async isPremium(): Promise<boolean> {
    try {
      await this.initialize();
      const customerInfo = await Purchases.getCustomerInfo();
      return this.checkPremiumStatus(customerInfo);
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  // Vérifier si l'utilisateur a accès à un voyage gratuit
  async hasFreeTripAccess(): Promise<boolean> {
    try {
      await this.initialize();
      const customerInfo = await Purchases.getCustomerInfo();
      return this.checkFreeTripAccess(customerInfo);
    } catch (error) {
      console.error('Error checking free trip access:', error);
      return false;
    }
  }

  // Vérifier si l'utilisateur a acheté un voyage à l'unité
  async hasSingleTripAccess(): Promise<boolean> {
    try {
      await this.initialize();
      const customerInfo = await Purchases.getCustomerInfo();
      return this.checkSingleTripAccess(customerInfo);
    } catch (error) {
      console.error('Error checking single trip access:', error);
      return false;
    }
  }

  // Méthodes privées pour vérifier les statuts
  private checkPremiumStatus(customerInfo: CustomerInfo): boolean {
    return customerInfo.entitlements.active['premium'] !== undefined;
  }

  private checkFreeTripAccess(customerInfo: CustomerInfo): boolean {
    // Logique pour vérifier l'accès au voyage gratuit
    // Vous pouvez implémenter votre propre logique ici
    return true; // Par défaut, tout le monde a un voyage gratuit
  }

  private checkSingleTripAccess(customerInfo: CustomerInfo): boolean {
    return customerInfo.entitlements.active['single_trip'] !== undefined;
  }

  // Restaurer les achats
  async restorePurchases(): Promise<boolean> {
    try {
      await this.initialize();
      const customerInfo = await Purchases.restorePurchases();
      return this.checkPremiumStatus(customerInfo);
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    }
  }

  // Obtenir les informations du client
  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      await this.initialize();
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Error getting customer info:', error);
      return null;
    }
  }
}

export const purchaseService = new PurchaseService(); 